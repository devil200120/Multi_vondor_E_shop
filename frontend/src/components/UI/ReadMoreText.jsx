import React, { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

const ReadMoreText = ({
  text,
  maxLength = 300, // Character limit instead of lines for more consistent behavior
  className = "",
  readMoreClassName = "",
  buttonClassName = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const needsTruncation = text.length > maxLength;

  const displayText =
    needsTruncation && !isExpanded
      ? text.substring(0, maxLength).trim() + "..."
      : text;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={className}>
      <div
        className={`leading-relaxed whitespace-pre-line ${readMoreClassName}`}
      >
        {displayText}
      </div>

      {needsTruncation && (
        <button
          onClick={toggleExpanded}
          className={`inline-flex items-center mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded-md px-2 py-1 -ml-2 ${buttonClassName}`}
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <HiChevronUp className="ml-1 w-4 h-4" />
            </>
          ) : (
            <>
              <span>Read More</span>
              <HiChevronDown className="ml-1 w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ReadMoreText;
