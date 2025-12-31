import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { HiChevronRight, HiChevronDown, HiCheck } from "react-icons/hi";

/**
 * CategoryTreeSelect - A tree-based category selector supporting unlimited depth
 *
 * @param {Array} categories - All categories from the database
 * @param {string} value - Currently selected category ID
 * @param {function} onChange - Callback when category is selected (receives category object)
 * @param {string} placeholder - Placeholder text when nothing is selected
 * @param {boolean} required - Whether selection is required
 * @param {string} className - Additional CSS classes
 */
const CategoryTreeSelect = ({
  categories = [],
  value,
  onChange,
  placeholder = "Select a category",
  required = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get root categories (no parent)
  const rootCategories = useMemo(
    () => categories.filter((cat) => !cat.parent),
    [categories]
  );

  // Get children of a category
  const getChildren = useCallback(
    (parentId) => {
      return categories.filter(
        (cat) => cat.parent === parentId || cat.parent?._id === parentId
      );
    },
    [categories]
  );

  // Get the full path of a category (for display)
  const getCategoryPath = useCallback(
    (categoryId) => {
      const path = [];
      let current = categories.find((cat) => cat._id === categoryId);

      while (current) {
        path.unshift(current.name);
        const parentId = current.parent?._id || current.parent;
        current = parentId
          ? categories.find((cat) => cat._id === parentId)
          : null;
      }

      return path.join(" > ");
    },
    [categories]
  );

  // Get selected category object
  const selectedCategory = useMemo(
    () => categories.find((cat) => cat._id === value),
    [categories, value]
  );

  // Toggle expand/collapse
  const toggleExpand = (categoryId, e) => {
    e.stopPropagation();
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Handle category selection
  const handleSelect = (category) => {
    onChange(category);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Filter categories based on search
  const filterCategories = useCallback(
    (cats, term) => {
      if (!term) return cats;

      const lowerTerm = term.toLowerCase();
      const matchingIds = new Set();

      // Find all matching categories and their ancestors
      categories.forEach((cat) => {
        if (cat.name.toLowerCase().includes(lowerTerm)) {
          matchingIds.add(cat._id);
          // Add all ancestors
          let current = cat;
          while (current.parent) {
            const parentId = current.parent?._id || current.parent;
            matchingIds.add(parentId);
            current = categories.find((c) => c._id === parentId);
            if (!current) break;
          }
        }
      });

      return cats.filter((cat) => matchingIds.has(cat._id));
    },
    [categories]
  );

  // Auto-expand when searching
  useEffect(() => {
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      const toExpand = new Set();

      categories.forEach((cat) => {
        if (cat.name.toLowerCase().includes(lowerTerm)) {
          let current = cat;
          while (current.parent) {
            const parentId = current.parent?._id || current.parent;
            toExpand.add(parentId);
            current = categories.find((c) => c._id === parentId);
            if (!current) break;
          }
        }
      });

      setExpandedCategories(toExpand);
    }
  }, [searchTerm, categories]);

  // Recursive tree item component
  const TreeItem = ({ category, level = 0 }) => {
    const children = getChildren(category._id);
    const hasKids = children.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const isSelected = value === category._id;

    // Filter children if searching
    const filteredChildren = searchTerm
      ? filterCategories(children, searchTerm)
      : children;

    // Hide if searching and no matching children and self doesn't match
    if (
      searchTerm &&
      !category.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      filteredChildren.length === 0
    ) {
      return null;
    }

    return (
      <div>
        <div
          className={`flex items-center py-2 px-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors ${
            isSelected ? "bg-blue-100 text-blue-700" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleSelect(category)}
        >
          {/* Expand/Collapse Button */}
          {hasKids ? (
            <button
              type="button"
              onClick={(e) => toggleExpand(category._id, e)}
              className="p-1 hover:bg-gray-200 rounded mr-1 flex-shrink-0"
            >
              {isExpanded ? (
                <HiChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <HiChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-6 mr-1 flex-shrink-0" />
          )}

          {/* Category Image */}
          {category.image && (
            <img
              src={category.image?.url || category.image}
              alt={category.name}
              className="w-5 h-5 rounded object-cover mr-2 flex-shrink-0"
            />
          )}

          {/* Category Name */}
          <span
            className={`flex-1 text-sm ${isSelected ? "font-semibold" : ""}`}
          >
            {category.name}
          </span>

          {/* Selected Indicator */}
          {isSelected && (
            <HiCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
          )}
        </div>

        {/* Children */}
        {hasKids && isExpanded && (
          <div>
            {filteredChildren.map((child) => (
              <TreeItem key={child._id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredRootCategories = searchTerm
    ? filterCategories(rootCategories, searchTerm)
    : rootCategories;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md flex items-center justify-between ${
          !selectedCategory ? "text-gray-500" : "text-gray-900"
        }`}
      >
        <span className="truncate">
          {selectedCategory ? getCategoryPath(value) : placeholder}
        </span>
        <HiChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value || ""}
          required
          className="sr-only"
          tabIndex={-1}
          onChange={() => {}}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Category Tree */}
          <div className="overflow-y-auto max-h-60 p-2">
            {/* Clear Selection Option */}
            {value && (
              <div
                className="flex items-center py-2 px-3 cursor-pointer hover:bg-gray-50 rounded-lg mb-1 text-gray-500"
                onClick={() => handleSelect(null)}
              >
                <span className="text-sm">Clear selection</span>
              </div>
            )}

            {filteredRootCategories.length > 0 ? (
              filteredRootCategories.map((category) => (
                <TreeItem key={category._id} category={category} level={0} />
              ))
            ) : (
              <div className="py-4 text-center text-gray-500 text-sm">
                {searchTerm ? "No categories found" : "No categories available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTreeSelect;
