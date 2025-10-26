import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// This import path is for pdfjs-dist v3.
// If you are using v4+, you might need: import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { authenticateToken } from '../middleware/auth.js';
// === UPDATED: Import the new single function ===
import { generateAiContent } from '../services/aiProcessor.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and TXT files
    const allowedTypes = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf and .txt files are allowed'));
    }
  }
});

/**
 * POST /api/courses/:id/upload
 * (This route handler remains the same)
 */
router.post('/courses/:id/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Verify course exists and belongs to user
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Course not found.' });
    }

    if (course.userId !== userId) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Create Material record with PROCESSING status
    const material = await prisma.material.create({
      data: {
        filename: req.file.originalname,
        status: 'PROCESSING',
        courseId
      }
    });

    // Respond immediately with 202 Accepted
    res.status(202).json({
      id: material.id,
      filename: material.filename,
      status: material.status
    });

    // Start background processing (non-blocking)
    processFileInBackground(req.file.path, material.id, userId, prisma, io);

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload file.' });
  }
});

/**
 * Background processing function (asynchronous)
 * (This function is now much simpler)
 */
async function processFileInBackground(filePath, materialId, userId, prisma, io) {
  try {
    // Step 1: Read and parse the file (Same as before)
    let rawText = '';
    const fileExt = path.extname(filePath).toLowerCase();

    if (fileExt === '.pdf') {
      const dataBuffer = await fs.promises.readFile(filePath);
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(dataBuffer),
        useSystemFonts: true,
        // This path assumes your 'node_modules' is in the root of 'server'
        // If not, you may need to adjust it (e.g., path.join(process.cwd(), 'node_modules', ...))
        standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/'
      });
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      const textPromises = [];
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        textPromises.push(
          pdfDocument.getPage(pageNum).then(page => 
            page.getTextContent().then(textContent => 
              textContent.items.map(item => item.str).join(' ')
            )
          )
        );
      }
      const pageTexts = await Promise.all(textPromises);
      rawText = pageTexts.join('\n');
    } else if (fileExt === '.txt') {
      rawText = await fs.promises.readFile(filePath, 'utf-8');
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('No text content found in file');
    }

    // ======================================================================
    // === FIX: Make only ONE call to the AI
    // ======================================================================
    
    // This one function returns an object: { summary, keywords, flashcards }
    const aiData = await generateAiContent(rawText);

    // ======================================================================
    
    // Step 4: Database transaction
    await prisma.$transaction(async (tx) => {
      // Create AiData record
      await tx.aiData.create({
        data: {
          summary: aiData.summary,
          keywords: aiData.keywords, // This is already a clean string[]
          materialId
        }
      });

      // Create Flashcard records
      await tx.flashcard.createMany({
        data: aiData.flashcards.map(fc => ({ // This is already a clean object[]
          question: fc.question,
          answer: fc.answer,
          materialId
        }))
      });

      // Update Material status to COMPLETED
      await tx.material.update({
        where: { id: materialId },
        data: { status: 'COMPLETED' }
      });
    });

    console.log(`💾 Database updated for material ${materialId}`);

    // Step 5: Send real-time notification via Socket.IO
    io.to(userId).emit('file_processed', {
      materialId,
      status: 'COMPLETED'
    });

    // Step 6: Clean up uploaded file
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }

  } catch (error) {
    console.error('❌ Background processing error:', error);

    // Update material status to ERROR
    try {
      await prisma.material.update({
        where: { id: materialId },
        data: { status: 'ERROR' }
      });

      // Notify user of error
      io.to(userId).emit('file_processed', {
        materialId,
        status: 'ERROR'
      });
    } catch (dbError) {
      console.error('Error updating material status to ERROR:', dbError);
    }

    // Clean up file
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting failed file:', unlinkError);
    }
  }
}

/**
 * GET /api/materials/:id/summary
 * (This route handler remains the same)
 */
router.get('/materials/:id/summary', authenticateToken, async (req, res) => {
  try {
    const { id: materialId } = req.params;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    // Find material and verify ownership through course
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        course: true,
        aiData: true
      }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found.' });
    }

    if (material.course.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (!material.aiData) {
      return res.status(404).json({ error: 'Summary not yet available. File may still be processing.' });
    }

    res.status(200).json({
      materialId: material.id,
      summary: material.aiData.summary
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary.' });
  }
});

/**
 * GET /api/materials/:id/flashcards
 * (This route handler remains the same)
 */
router.get('/materials/:id/flashcards', authenticateToken, async (req, res) => {
  try {
    const { id: materialId } = req.params;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    // Find material and verify ownership through course
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        course: true,
        flashcards: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found.' });
    }

    if (material.course.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (material.flashcards.length === 0) {
      return res.status(404).json({ error: 'Flashcards not yet available. File may still be processing.' });
    }

    // Format response as specified in PRD
    const flashcardsResponse = material.flashcards.map(fc => ({
      q: fc.question,
      a: fc.answer
    }));

    res.status(200).json(flashcardsResponse);

  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards.' });
  }
});

/**
 * DELETE /api/materials/:id
 * Delete a material and all related data (aiData, flashcards)
 */
router.delete('/materials/:id', authenticateToken, async (req, res) => {
  try {
    const { id: materialId } = req.params;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    // Find material and verify ownership through course
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        course: true
      }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found.' });
    }

    if (material.course.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Use transaction to delete in correct order to avoid foreign key constraint errors
    await prisma.$transaction(async (tx) => {
      // Step 1: Delete related Flashcard records first
      await tx.flashcard.deleteMany({
        where: { materialId }
      });

      // Step 2: Delete related AiData record
      await tx.aiData.deleteMany({
        where: { materialId }
      });

      // Step 3: Finally, delete the Material record itself
      await tx.material.delete({
        where: { id: materialId }
      });
    });

    res.status(200).json({ message: 'Material deleted successfully.' });

  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Failed to delete material.' });
  }
});

export default router;

