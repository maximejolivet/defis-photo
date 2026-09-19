const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'];

export function isVideoPath(imagePath: string): boolean {
  // pop() renvoie string | undefined pour TypeScript, même si split() donne toujours au moins un élément.
  const ext = imagePath.split('.').pop()?.toLowerCase() ?? '';
  return VIDEO_EXTENSIONS.includes(ext);
}
