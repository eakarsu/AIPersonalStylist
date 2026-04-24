export default function AIOutput({ data, loading, onClose }) {
  if (loading) {
    return (
      <div className="ai-output-overlay">
        <div className="ai-output-modal">
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <span></span><span></span><span></span>
            </div>
            <p>AI is analyzing your style data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatAIResponse = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentSection = null;
    let listItems = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="ai-list">
            {listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        return;
      }

      // Headers with ## or **Title**
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        flushList();
        const text = trimmed.replace(/^#+\s*/, '');
        elements.push(
          <h3 key={idx} className="ai-section-title">
            <span className="material-icons-outlined ai-section-icon">auto_awesome</span>
            {text}
          </h3>
        );
        return;
      }

      // Bold section headers like **1. Title** or **Title:**
      const boldMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
      if (boldMatch && !trimmed.startsWith('- ') && !trimmed.startsWith('* ')) {
        flushList();
        elements.push(
          <h3 key={idx} className="ai-section-title">
            <span className="material-icons-outlined ai-section-icon">auto_awesome</span>
            {boldMatch[1]}
          </h3>
        );
        if (boldMatch[2]) {
          elements.push(<p key={`${idx}-p`} className="ai-paragraph">{formatInlineText(boldMatch[2])}</p>);
        }
        return;
      }

      // Numbered headers like "1. Title" or "1) Title"
      const numberedHeader = trimmed.match(/^(\d+)[.)]\s+\*\*(.+?)\*\*:?\s*(.*)/);
      if (numberedHeader) {
        flushList();
        elements.push(
          <h3 key={idx} className="ai-section-title">
            <span className="ai-number">{numberedHeader[1]}</span>
            {numberedHeader[2]}
          </h3>
        );
        if (numberedHeader[3]) {
          elements.push(<p key={`${idx}-p`} className="ai-paragraph">{formatInlineText(numberedHeader[3])}</p>);
        }
        return;
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^•/)) {
        const text = trimmed.replace(/^[-*•]\s*/, '');
        listItems.push(formatInlineText(text));
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(<p key={idx} className="ai-paragraph">{formatInlineText(trimmed)}</p>);
    });

    flushList();
    return elements;
  };

  const formatInlineText = (text) => {
    // Handle **bold** and *italic*
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const italicMatch = remaining.match(/\*(.+?)\*/);

      if (boldMatch && (!italicMatch || boldMatch.index <= italicMatch.index)) {
        if (boldMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
        }
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else if (italicMatch) {
        if (italicMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, italicMatch.index)}</span>);
        }
        parts.push(<em key={key++}>{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        remaining = '';
      }
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="ai-output-overlay" onClick={onClose}>
      <div className="ai-output-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-output-header">
          <div className="ai-output-title">
            <span className="material-icons-outlined">auto_awesome</span>
            <h2>AI Style Analysis</h2>
          </div>
          <div className="ai-output-meta">
            <span className="ai-model-badge">
              <span className="material-icons-outlined">smart_toy</span>
              {data.model || 'AI'}
            </span>
            {data.usage?.total_tokens && (
              <span className="ai-tokens">{data.usage.total_tokens} tokens</span>
            )}
          </div>
          <button className="btn-close" onClick={onClose}>
            <span className="material-icons-outlined">close</span>
          </button>
        </div>
        <div className="ai-output-body">
          {formatAIResponse(data.response)}
        </div>
        <div className="ai-output-footer">
          <span className="ai-timestamp">
            Generated {new Date(data.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
