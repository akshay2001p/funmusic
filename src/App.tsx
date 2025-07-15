import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { 
  MusicalNoteIcon, 
  PlusIcon, 
  HeartIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid'
import { songsService, favoritesService } from './lib/supabase'

// Simple components without external dependencies
interface Song {
  id: string
  title: string
  artist: string
  duration: number
  file_url: string
  cover_image_url?: string
  created_at: string
}

type TabType = 'all' | 'favorites'

// Simple Music Player Component
const MusicPlayer: React.FC<{
  currentSong: Song | null
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onFavorite: (songId: string) => void
  favorites: string[]
}> = ({ currentSong, isPlaying, onPlayPause, onNext, onPrevious, onFavorite, favorites }) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = React.useRef<HTMLAudioElement>(null)

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

  if (!currentSong) {
    return (
      <div className="player">
        <div className="player-content">
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            Select a song to start playing
          </div>
        </div>
      </div>
    )
  }

  const isFavorited = favorites.includes(currentSong.id)

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={currentSong.file_url}
        onEnded={onNext}
      />
      
      <div className="player-content">
        <div className="player-song-info">
          <div className="song-cover">
            {currentSong.title.charAt(0)}
          </div>
          <div>
            <div className="song-title">{currentSong.title}</div>
            <div className="song-artist">{currentSong.artist}</div>
          </div>
          <button
            className={`icon-btn heart-icon ${isFavorited ? 'favorited' : ''}`}
            onClick={() => onFavorite(currentSong.id)}
          >
            <HeartIcon style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>
        </div>

        <div className="player-controls">
          <div className="player-buttons">
            <button onClick={onPrevious} className="icon-btn">
              ⏮
            </button>
            <button onClick={onPlayPause} className="player-main-btn">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={onNext} className="icon-btn">
              ⏭
            </button>
          </div>
          
          <div className="progress-container">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleProgressChange}
              className="progress-bar"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="volume-controls">
          🔊
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value)
              setVolume(newVolume)
              if (audioRef.current) {
                audioRef.current.volume = newVolume
              }
            }}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  )
}

// Simple Song List Component
const SongList: React.FC<{
  songs: Song[]
  currentSong: Song | null
  isPlaying: boolean
  onSongSelect: (song: Song) => void
  onFavorite: (songId: string) => void
  favorites: string[]
}> = ({ songs, currentSong, isPlaying, onSongSelect, onFavorite, favorites }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="song-list">
      {songs.map((song, index) => {
        const isCurrentSong = currentSong?.id === song.id
        const isFavorited = favorites.includes(song.id)
        
        return (
          <div
            key={song.id}
            className={`song-item ${isCurrentSong ? 'current' : ''}`}
            onClick={() => onSongSelect(song)}
          >
            <div className="song-number">
              {isCurrentSong && isPlaying ? '🎵' : index + 1}
            </div>

            <div className="song-cover">
              {song.title.charAt(0)}
            </div>

            <div className="song-info">
              <div className="song-title">{song.title}</div>
              <div className="song-artist">{song.artist}</div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(song.id)
              }}
              className={`icon-btn heart-icon ${isFavorited ? 'favorited' : ''}`}
            >
              <HeartIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>

            <div className="song-duration">
              {formatDuration(song.duration)}
            </div>
          </div>
        )
      })}
      
      {songs.length === 0 && (
        <div className="empty-state">
          <h3>No songs uploaded yet</h3>
          <p>Upload your first song to get started</p>
        </div>
      )}
    </div>
  )
}

// Simple Upload Modal Component
const UploadModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, metadata: { title: string; artist: string }) => Promise<void>
}> = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file')
      return
    }
    
    setSelectedFile(file)
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    setTitle(fileName)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !title.trim() || !artist.trim()) {
      toast.error('Please fill all fields and select a file')
      return
    }

    setIsUploading(true)
    try {
      await onUpload(selectedFile, { title: title.trim(), artist: artist.trim() })
      setSelectedFile(null)
      setTitle('')
      setArtist('')
      onClose()
      toast.success('Song uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload song')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Upload Song</h2>
          <button onClick={onClose} className="icon-btn">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`upload-area ${selectedFile ? 'has-file' : ''}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const files = e.target.files
                if (files && files.length > 0) {
                  handleFileSelect(files[0])
                }
              }}
              style={{ display: 'none' }}
            />
            
            {selectedFile ? (
              <div>
                <div className="upload-icon">🎵</div>
                <p>{selectedFile.name}</p>
                <p style={{ color: '#10b981', fontSize: '0.875rem' }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div>
                <div className="upload-icon">📁</div>
                <p>Drop your audio file here</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>or</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  Browse Files
                </button>
                <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Supports MP3, WAV, OGG, and other audio formats
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">Song Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Enter song title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="artist" className="form-label">Artist *</label>
            <input
              id="artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="input"
              placeholder="Enter artist name"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || !title.trim() || !artist.trim() || isUploading}
              className="btn btn-primary"
            >
              {isUploading ? 'Uploading...' : 'Upload Song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSongs()
    loadFavorites()
  }, [])

  const loadSongs = async () => {
    try {
      setLoading(true)
      
      // Try to fetch from Supabase first
      try {
        const supabaseSongs = await songsService.getAllSongs()
        if (supabaseSongs.length > 0) {
          setSongs(supabaseSongs)
          return
        }
      } catch (supabaseError) {
        console.warn('Supabase not configured or no songs found, using demo songs:', supabaseError)
      }
      
      // Fallback to demo songs if Supabase fails or returns no songs
      const mockSongs: Song[] = [
        {
          id: '1',
          title: 'Sample Song 1',
          artist: 'Demo Artist',
          duration: 180,
          file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Sample Song 2',
          artist: 'Demo Artist 2',
          duration: 210,
          file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          created_at: new Date().toISOString()
        }
      ]
      setSongs(mockSongs)
    } catch (error) {
      console.error('Error loading songs:', error)
      toast.error('Failed to load songs')
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = async () => {
    try {
      setFavorites(['1'])
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const handleSongSelect = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song)
      setIsPlaying(true)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (!currentSong) return
    const currentIndex = songs.findIndex(song => song.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % songs.length
    setCurrentSong(songs[nextIndex])
    setIsPlaying(true)
  }

  const handlePrevious = () => {
    if (!currentSong) return
    const currentIndex = songs.findIndex(song => song.id === currentSong.id)
    const previousIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1
    setCurrentSong(songs[previousIndex])
    setIsPlaying(true)
  }

  const handleFavorite = async (songId: string) => {
    try {
      const isFavorited = favorites.includes(songId)
      
      if (isFavorited) {
        setFavorites(favorites.filter(id => id !== songId))
        toast.success('Removed from favorites')
      } else {
        setFavorites([...favorites, songId])
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
      toast.error('Failed to update favorites')
    }
  }

  const handleUpload = async (file: File, metadata: { title: string; artist: string }) => {
    try {
      // Try to upload to Supabase first
      try {
        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${metadata.title.replace(/[^a-zA-Z0-9]/g, '-')}.${fileExt}`
        
        // Upload file to Supabase Storage
        const fileUrl = await songsService.uploadAudioFile(file, fileName)
        
        // Create song record in database
        const newSong = await songsService.createSong({
          title: metadata.title,
          artist: metadata.artist,
          duration: 180, // You might want to calculate actual duration
          file_url: fileUrl
        })
        
        // Add to local state
        setSongs(prevSongs => [newSong, ...prevSongs])
        toast.success('Song uploaded to Supabase successfully!')
        return
      } catch (supabaseError) {
        console.warn('Supabase upload failed, using local storage:', supabaseError)
        toast('Supabase not configured, storing locally', { icon: '⚠️' })
      }
      
      // Fallback to local storage if Supabase fails
      const newSong: Song = {
        id: Date.now().toString(),
        title: metadata.title,
        artist: metadata.artist,
        duration: 180,
        file_url: URL.createObjectURL(file),
        created_at: new Date().toISOString()
      }
      
      setSongs(prevSongs => [newSong, ...prevSongs])
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'favorites') {
      return matchesSearch && favorites.includes(song.id)
    }
    
    return matchesSearch
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: 'white' }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid #374151'
          }
        }}
      />
      
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <MusicalNoteIcon style={{ width: '2rem', height: '2rem', color: '#0ea5e9' }} />
              <span>FunMusic</span>
            </div>
            
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn btn-primary"
            >
              <PlusIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              Upload Song
            </button>
          </div>
        </div>
      </header>

      <main className="container main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div className="tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            >
              <Squares2X2Icon style={{ width: '1.25rem', height: '1.25rem' }} />
              All Songs
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            >
              <HeartIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              Favorites
            </button>
          </div>

          <div className="search-container">
            <MagnifyingGlassIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p style={{ color: '#9ca3af' }}>Loading songs...</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                {activeTab === 'favorites' ? 'Your Favorites' : 'All Songs'}
                <span style={{ color: '#9ca3af', fontSize: '1rem', marginLeft: '0.5rem' }}>
                  ({filteredSongs.length} songs)
                </span>
              </h2>
            </div>

            <SongList
              songs={filteredSongs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onSongSelect={handleSongSelect}
              onFavorite={handleFavorite}
              favorites={favorites}
            />
          </div>
        )}
      </main>

      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onFavorite={handleFavorite}
        favorites={favorites}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  )
}

export default App
