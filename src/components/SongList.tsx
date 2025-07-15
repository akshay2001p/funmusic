import React from 'react'
import { PlayIcon, PauseIcon, HeartIcon } from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'

interface Song {
  id: string
  title: string
  artist: string
  duration: number
  file_url: string
  cover_image_url?: string
  created_at: string
}

interface SongListProps {
  songs: Song[]
  currentSong: Song | null
  isPlaying: boolean
  onSongSelect: (song: Song) => void
  onFavorite: (songId: string) => void
  favorites: string[]
}

export const SongList: React.FC<SongListProps> = ({
  songs,
  currentSong,
  isPlaying,
  onSongSelect,
  onFavorite,
  favorites
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-2">
      {songs.map((song, index) => {
        const isCurrentSong = currentSong?.id === song.id
        const isFavorited = favorites.includes(song.id)
        
        return (
          <div
            key={song.id}
            className={`group flex items-center p-4 rounded-lg transition-colors cursor-pointer ${
              isCurrentSong 
                ? 'bg-primary-500/20 border border-primary-500/30' 
                : 'hover:bg-gray-800/50'
            }`}
            onClick={() => onSongSelect(song)}
          >
            {/* Track Number / Play Button */}
            <div className="w-12 flex items-center justify-center">
              {isCurrentSong && isPlaying ? (
                <PauseIcon className="w-5 h-5 text-primary-400" />
              ) : (
                <>
                  <span className={`text-sm group-hover:hidden ${
                    isCurrentSong ? 'text-primary-400' : 'text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                  <PlayIcon className="w-5 h-5 text-white hidden group-hover:block" />
                </>
              )}
            </div>

            {/* Album Art */}
            <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden ml-4">
              {song.cover_image_url ? (
                <img
                  src={song.cover_image_url}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
                  <span className="text-sm font-bold text-white">
                    {song.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="flex-1 ml-4 min-w-0">
              <h3 className={`font-medium truncate ${
                isCurrentSong ? 'text-primary-400' : 'text-white'
              }`}>
                {song.title}
              </h3>
              <p className="text-gray-400 text-sm truncate">{song.artist}</p>
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(song.id)
              }}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors mr-4"
            >
              {isFavorited ? (
                <HeartIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartOutlineIcon className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
              )}
            </button>

            {/* Duration */}
            <div className="text-gray-400 text-sm">
              {formatDuration(song.duration)}
            </div>
          </div>
        )
      })}
      
      {songs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No songs uploaded yet</p>
          <p className="text-gray-500 text-sm mt-2">Upload your first song to get started</p>
        </div>
      )}
    </div>
  )
}
