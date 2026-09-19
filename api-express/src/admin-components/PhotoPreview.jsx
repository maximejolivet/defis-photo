import React from 'react'

// Rendu custom d'un champ AdminJS : `where` vaut 'list' ou 'show'.
// Les fichiers sont servis par Express sur /uploads (même origine que /admin).
const PhotoPreview = ({ record, where }) => {
  const file = record?.params?.image_path
  if (!file) return null

  const size = where === 'list' ? { height: 48 } : { maxWidth: '100%', maxHeight: 480 }

  return (
    <a href={`/uploads/${file}`} target="_blank" rel="noreferrer">
      <img src={`/uploads/${file}`} alt={file} loading="lazy" style={{ borderRadius: 4, ...size }} />
    </a>
  )
}

export default PhotoPreview
