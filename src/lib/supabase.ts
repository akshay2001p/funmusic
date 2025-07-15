import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Song {
  id: string
  title: string
  artist: string
  duration: number
  file_url: string
  cover_image_url?: string
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  song_id: string
  created_at: string
}

// Song-related functions
export const songsService = {
  // Fetch all songs
  async getAllSongs(): Promise<Song[]> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching songs:', error)
      throw error
    }

    return data || []
  },

  // Insert a new song
  async createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<Song> {
    const { data, error } = await supabase
      .from('songs')
      .insert([song])
      .select()
      .single()

    if (error) {
      console.error('Error creating song:', error)
      throw error
    }

    return data
  },

  // Upload audio file to Supabase Storage
  async uploadAudioFile(file: File, fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('music-files')
      .upload(fileName, file)

    if (error) {
      console.error('Error uploading file:', error)
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('music-files')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  },

  // Delete a song
  async deleteSong(songId: string): Promise<void> {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)

    if (error) {
      console.error('Error deleting song:', error)
      throw error
    }
  }
}

// Favorites-related functions (for future user authentication)
export const favoritesService = {
  // Get user favorites (placeholder for when you add auth)
  async getUserFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('song_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching favorites:', error)
      throw error
    }

    return data?.map(fav => fav.song_id) || []
  },

  // Add to favorites
  async addToFavorites(userId: string, songId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, song_id: songId }])

    if (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  },

  // Remove from favorites
  async removeFromFavorites(userId: string, songId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', songId)

    if (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  }
}
