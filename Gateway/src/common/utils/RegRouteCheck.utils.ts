export const matchRoute = (path: string, patterns: string[]) => {
  return patterns.some(pattern => {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
    return regex.test(path);
  });
};