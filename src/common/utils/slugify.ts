export const slugify = (text: string): string => {
    return text.toLowerCase()
        .replace(/[&(){}\[\]]/g, '_')  // Replace &, (), [], {} with underscores
        .replace(/[^\w\s-]/g, '')      // Remove remaining special characters except spaces and hyphens
        .replace(/[\s-]+/g, '_')       // Replace spaces and hyphens with underscores
        .replace(/_+/g, '_')           // Replace multiple underscores with a single underscore
        .replace(/^_+|_+$/g, '');      // Remove leading and trailing underscores
};
