export function createFormatValue(pattern: string): (n: number) => string {
  return (n: number) => {
    // Handle population-style abbreviation (pattern is just "{value}")
    if (pattern === "{value}") {
      if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
      return n.toLocaleString();
    }
    return pattern.replace("{value}", n.toLocaleString());
  };
}
