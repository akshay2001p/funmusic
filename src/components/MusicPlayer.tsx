import React, { useState, useRef, useEffect } from 'react'
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  SpeakerWaveIcon,
  HeartIcon
} from '@heroicons/react/24/solid'
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

interface MusicPlayerProps {
  currentSong: Song | null
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onFavorite: (songId: string) => void
  favorites: string[]
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onFavorite,
  favorites
}) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying, currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
    }
  }, [volume])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (audio) {
      const newTime = (parseFloat(e.target.value) / 100) * duration
      audio.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const isFavorited = currentSong ? favorites.includes(currentSong.id) : false

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-dark-200 border-t border-gray-800 p-4">
        <div className="text-center text-gray-400">
          Select a song to start playing
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-200 border-t border-gray-800 p-4">
      <audio
        ref={audioRef}
        src={currentSong.file_url}
        onEnded={onNext}
      />
      
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-14 h-14 bg-gray-700 rounded-lg overflow-hidden">
            {currentSong.cover_image_url ? (
              <img
                src={currentSong.cover_image_url}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
                <span className="text-xl font-bold text-white">
                  {currentSong.title.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
            <p className="text-gray-400 text-sm truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => onFavorite(currentSong.id)}
            className="ml-4"
          >
            {isFavorited ? (
              <HeartIcon className="w-6 h-6 text-red-500" />
            ) : (
              <HeartOutlineIcon className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>

        {/* Controls */}
        <div className="flex-1 max-w-md mx-8">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <button
              onClick={onPrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <BackwardIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={onPlayPause}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
            
            <button
              onClick={onNext}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ForwardIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleProgressChange}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
