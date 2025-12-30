import React from "react";
import { useCurrency } from "../context/CurrencyContext";

/**
 * Price component - displays formatted price using global currency settings
 *
 * Usage:
 * <Price amount={99.99} />
 * <Price amount={99.99} className="text-xl font-bold" />
 * <Price amount={99.99} showCode />
 */
const Price = ({
  amount,
  className = "",
  showCode = false,
  showSymbol = true,
}) => {
  const { formatPrice, loading } = useCurrency();

  if (loading) {
    return <span className={className}>...</span>;
  }

  if (amount === null || amount === undefined) {
    return null;
  }

  return (
    <span className={className}>
      {formatPrice(amount, { showCode, showSymbol })}
    </span>
  );
};

export default Price;
