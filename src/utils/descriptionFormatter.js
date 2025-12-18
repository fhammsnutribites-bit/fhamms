/**
 * Auto-formats product description text into HTML
 * Converts plain text with patterns into formatted paragraphs and lists
 * @param {string} text - Raw description text
 * @returns {string} Formatted HTML string
 */
export const formatDescription = (text) => {
  if (!text) return '';

  // Split text into sections based on double line breaks or specific patterns
  const sections = text.split(/\n\s*\n/).filter(section => section.trim());

  const formattedSections = sections.map(section => {
    const trimmedSection = section.trim();

    // Check if this section is a benefits section (contains "Benefits:" or checkmarks)
    if (trimmedSection.includes('Benefits:') || trimmedSection.includes('✔️')) {
      return formatBenefitsSection(trimmedSection);
    }

    // Check if this section contains bullet points (lines starting with -, •, or *)
    if (trimmedSection.includes('\n-') || trimmedSection.includes('\n•') || trimmedSection.includes('\n*')) {
      return formatBulletPoints(trimmedSection);
    }

    // Regular paragraph
    return `<p>${trimmedSection}</p>`;
  });

  return formattedSections.join('');
};

/**
 * Formats a benefits section with checkmarks into a proper list
 * @param {string} text - Benefits section text
 * @returns {string} Formatted HTML
 */
const formatBenefitsSection = (text) => {
  // Remove "Benefits:" prefix if present
  let cleanText = text.replace(/^Benefits:\s*/, '');

  // Split by checkmark emoji and clean up
  const benefits = cleanText.split('✔️')
    .map(benefit => benefit.trim())
    .filter(benefit => benefit.length > 0);

  if (benefits.length === 0) return `<p>${text}</p>`;

  const listItems = benefits.map(benefit =>
    `<li class="description-benefit-item">${benefit}</li>`
  ).join('');

  return `
    <div class="description-benefits-section">
      <h4 class="description-benefits-title">Benefits:</h4>
      <ul class="description-benefits-list">
        ${listItems}
      </ul>
    </div>
  `;
};

/**
 * Formats bullet point sections into proper HTML lists
 * @param {string} text - Text with bullet points
 * @returns {string} Formatted HTML
 */
const formatBulletPoints = (text) => {
  const lines = text.split('\n').map(line => line.trim());

  // Check if all lines are bullet points
  const bulletLines = lines.filter(line =>
    line.startsWith('-') || line.startsWith('•') || line.startsWith('*')
  );

  if (bulletLines.length === lines.length && bulletLines.length > 1) {
    // All lines are bullets, format as list
    const listItems = bulletLines.map(line => {
      const cleanLine = line.replace(/^[-•*]\s*/, '');
      return `<li>${cleanLine}</li>`;
    }).join('');

    return `<ul class="description-bullet-list">${listItems}</ul>`;
  }

  // Mixed content or single bullet, return as paragraphs
  return `<p>${text}</p>`;
};

