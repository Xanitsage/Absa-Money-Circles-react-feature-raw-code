
document.addEventListener('DOMContentLoaded', () => {
  // Make nodes clickable
  const nodes = document.querySelectorAll('.node .content');
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const route = node.parentElement.getAttribute('data-route');
      if (route) {
        // Highlight the clicked node
        nodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        
        // In a real app, this would navigate to the route
        console.log(`Navigating to: ${route}`);
      }
    });
  });

  // Add hover effect to show connections
  nodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      const parent = node.closest('.node');
      if (parent) {
        parent.classList.add('highlight');
      }
    });

    node.addEventListener('mouseleave', () => {
      const parent = node.closest('.node');
      if (parent) {
        parent.classList.remove('highlight');
      }
    });
  });
});
