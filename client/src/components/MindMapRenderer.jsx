import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

function MindMapRenderer({ chartCode }) {
  const ref = useRef(null);

  useEffect(() => {
    // Initialize mermaid with configuration
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: 'default',
      securityLevel: 'loose',
      mindmap: {
        padding: 20
      }
    });

    if (ref.current && chartCode) {
      // Clear previous SVG
      ref.current.innerHTML = '';
      
      // Generate unique ID for this diagram
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      // Render the mermaid diagram
      mermaid.render(id, chartCode)
        .then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = `
              <div class="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
                <p class="font-semibold mb-2">Failed to render mind map</p>
                <p class="text-sm">${error.message || 'Unknown error'}</p>
              </div>
            `;
          }
        });
    }
  }, [chartCode]);

  return (
    <div 
      className="overflow-auto p-6 flex justify-center items-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-inner border border-purple-200 min-h-[400px]" 
      ref={ref}
    >
      {!chartCode && (
        <p className="text-gray-500">Click "Generate Mind Map" to visualize the summary</p>
      )}
    </div>
  );
}

export default MindMapRenderer;
