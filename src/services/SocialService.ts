import { supabase } from '../integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrls?: string[];
  tags?: string[];
  linkedPlayers?: string[];
  linkedTeams?: string[];
  linkedLeagues?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Article {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  summary: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  category: ArticleCategory;
  featuredPlayerIds?: string[];
  featuredTeamIds?: string[];
  views: number;
  likes: number;
  comments: number;
  published: boolean;
  publishedAt: string;
  updatedAt?: string;
}

export enum ArticleCategory {
  ANALYSIS = 'analysis',
  NEWS = 'news',
  STRATEGY = 'strategy',
  ROOKIE = 'rookie',
  DYNASTY = 'dynasty',
  REDRAFT = 'redraft',
  FANTASY = 'fantasy',
  NFL = 'nfl'
}

export interface Podcast {
  id: string;
  title: string;
  host: string;
  hostAvatar?: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  duration: number; // in seconds
  tags?: string[];
  category: PodcastCategory;
  featuredPlayerIds?: string[];
  featuredTeamIds?: string[];
  plays: number;
  likes: number;
  comments: number;
  published: boolean;
  publishedAt: string;
  updatedAt?: string;
}

export enum PodcastCategory {
  DYNASTY = 'dynasty',
  REDRAFT = 'redraft',
  ROOKIE = 'rookie',
  NFL = 'nfl',
  DRAFT = 'draft',
  STRATEGY = 'strategy',
  INTERVIEW = 'interview'
}

export interface Video {
  id: string;
  title: string;
  creator: string;
  creatorAvatar?: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  tags?: string[];
  category: VideoCategory;
  featuredPlayerIds?: string[];
  featuredTeamIds?: string[];
  views: number;
  likes: number;
  comments: number;
  published: boolean;
  publishedAt: string;
  updatedAt?: string;
}

export enum VideoCategory {
  HIGHLIGHTS = 'highlights',
  ANALYSIS = 'analysis',
  TUTORIAL = 'tutorial',
  DRAFT = 'draft',
  STRATEGY = 'strategy',
  INTERVIEW = 'interview',
  NFL = 'nfl'
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  topics: number;
  posts: number;
  lastPostAt: string;
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  forumId: string;
  title: string;
  author: string;
  authorAvatar?: string;
  posts: number;
  views: number;
  lastPostAt: string;
  createdAt: string;
  isPinned: boolean;
  isLocked: boolean;
}

export interface ForumPost {
  id: string;
  topicId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  following: number;
  followers: number;
  posts: number;
  leagueIds?: string[];
  favoriteTeams?: string[];
  favoritePlayers?: string[];
}

export interface ContentFilter {
  search?: string;
  category?: string;
  tags?: string[];
  playerIds?: string[];
  teamIds?: string[];
  sortBy?: 'newest' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}

const SocialService = {
  // Posts
  async createPost(post: Omit<Post, 'id' | 'likes' | 'comments' | 'shares' | 'createdAt'>): Promise<Post | null> {
    const postId = uuidv4();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('social_posts')
      .insert([{
        id: postId,
        user_id: post.userId,
        user_name: post.userName,
        user_avatar: post.userAvatar,
        content: post.content,
        media_urls: post.mediaUrls || [],
        tags: post.tags || [],
        linked_players: post.linkedPlayers || [],
        linked_teams: post.linkedTeams || [],
        linked_leagues: post.linkedLeagues || [],
        likes: 0,
        comments: 0,
        shares: 0,
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating post:', error);
      return null;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      userAvatar: data.user_avatar,
      content: data.content,
      mediaUrls: data.media_urls,
      tags: data.tags,
      linkedPlayers: data.linked_players,
      linkedTeams: data.linked_teams,
      linkedLeagues: data.linked_leagues,
      likes: data.likes,
      comments: data.comments,
      shares: data.shares,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  async getPosts(filters: ContentFilter = {}): Promise<Post[]> {
    let query = supabase
      .from('social_posts')
      .select('*');
    
    // Apply filters
    if (filters.search) {
      query = query.ilike('content', `%${filters.search}%`);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    if (filters.playerIds && filters.playerIds.length > 0) {
      query = query.overlaps('linked_players', filters.playerIds);
    }
    
    if (filters.teamIds && filters.teamIds.length > 0) {
      query = query.overlaps('linked_teams', filters.teamIds);
    }
    
    // Apply sorting
    if (filters.sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (filters.sortBy === 'popular') {
      query = query.order('likes', { ascending: false });
    } else if (filters.sortBy === 'trending') {
      // For trending, we might want a more complex algorithm, but for now we'll use a simple heuristic
      query = query.order('created_at', { ascending: false }).order('likes', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
    
    return data.map(post => ({
      id: post.id,
      userId: post.user_id,
      userName: post.user_name,
      userAvatar: post.user_avatar,
      content: post.content,
      mediaUrls: post.media_urls,
      tags: post.tags,
      linkedPlayers: post.linked_players,
      linkedTeams: post.linked_teams,
      linkedLeagues: post.linked_leagues,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));
  },
  
  async getUserPosts(userId: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
    
    return data.map(post => ({
      id: post.id,
      userId: post.user_id,
      userName: post.user_name,
      userAvatar: post.user_avatar,
      content: post.content,
      mediaUrls: post.media_urls,
      tags: post.tags,
      linkedPlayers: post.linked_players,
      linkedTeams: post.linked_teams,
      linkedLeagues: post.linked_leagues,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));
  },
  
  async getPostsByTag(tag: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .contains('tags', [tag])
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts by tag:', error);
      return [];
    }
    
    return data.map(post => ({
      id: post.id,
      userId: post.user_id,
      userName: post.user_name,
      userAvatar: post.user_avatar,
      content: post.content,
      mediaUrls: post.media_urls,
      tags: post.tags,
      linkedPlayers: post.linked_players,
      linkedTeams: post.linked_teams,
      linkedLeagues: post.linked_leagues,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));
  },
  
  async likePost(postId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('social_posts')
      .select('likes')
      .eq('id', postId)
      .single();
    
    if (error) {
      console.error('Error fetching post likes:', error);
      return false;
    }
    
    const { error: updateError } = await supabase
      .from('social_posts')
      .update({ likes: data.likes + 1 })
      .eq('id', postId);
    
    if (updateError) {
      console.error('Error updating post likes:', updateError);
      return false;
    }
    
    return true;
  },
  
  async deletePost(postId: string): Promise<boolean> {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);
    
    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }
    
    return true;
  },
  
  // Comments
  async createComment(comment: Omit<Comment, 'id' | 'likes' | 'createdAt'>): Promise<Comment | null> {
    const commentId = uuidv4();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('social_comments')
      .insert([{
        id: commentId,
        post_id: comment.postId,
        user_id: comment.userId,
        user_name: comment.userName,
        user_avatar: comment.userAvatar,
        content: comment.content,
        likes: 0,
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating comment:', error);
      return null;
    }
    
    // Update post's comment count
    const { error: updateError } = await supabase
      .from('social_posts')
      .select('comments')
      .eq('id', comment.postId)
      .single();
    
    if (!updateError) {
      await supabase
        .from('social_posts')
        .update({ comments: updateError.comments + 1 })
        .eq('id', comment.postId);
    }
    
    return {
      id: data.id,
      postId: data.post_id,
      userId: data.user_id,
      userName: data.user_name,
      userAvatar: data.user_avatar,
      content: data.content,
      likes: data.likes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('social_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    return data.map(comment => ({
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      userName: comment.user_name,
      userAvatar: comment.user_avatar,
      content: comment.content,
      likes: comment.likes,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at
    }));
  },
  
  async likeComment(commentId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('social_comments')
      .select('likes')
      .eq('id', commentId)
      .single();
    
    if (error) {
      console.error('Error fetching comment likes:', error);
      return false;
    }
    
    const { error: updateError } = await supabase
      .from('social_comments')
      .update({ likes: data.likes + 1 })
      .eq('id', commentId);
    
    if (updateError) {
      console.error('Error updating comment likes:', updateError);
      return false;
    }
    
    return true;
  },
  
  async deleteComment(commentId: string, postId: string): Promise<boolean> {
    const { error } = await supabase
      .from('social_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
    
    // Update post's comment count
    const { data, error: fetchError } = await supabase
      .from('social_posts')
      .select('comments')
      .eq('id', postId)
      .single();
    
    if (!fetchError && data.comments > 0) {
      await supabase
        .from('social_posts')
        .update({ comments: data.comments - 1 })
        .eq('id', postId);
    }
    
    return true;
  },
  
  // Articles
  async createArticle(article: Omit<Article, 'id' | 'views' | 'likes' | 'comments' | 'publishedAt'>): Promise<Article | null> {
    const articleId = uuidv4();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('content_articles')
      .insert([{
        id: articleId,
        title: article.title,
        author: article.author,
        author_avatar: article.authorAvatar,
        summary: article.summary,
        content: article.content,
        cover_image: article.coverImage,
        tags: article.tags || [],
        category: article.category,
        featured_player_ids: article.featuredPlayerIds || [],
        featured_team_ids: article.featuredTeamIds || [],
        views: 0,
        likes: 0,
        comments: 0,
        published: article.published,
        published_at: article.published ? now : null,
        updated_at: now
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating article:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      authorAvatar: data.author_avatar,
      summary: data.summary,
      content: data.content,
      coverImage: data.cover_image,
      tags: data.tags,
      category: data.category as ArticleCategory,
      featuredPlayerIds: data.featured_player_ids,
      featuredTeamIds: data.featured_team_ids,
      views: data.views,
      likes: data.likes,
      comments: data.comments,
      published: data.published,
      publishedAt: data.published_at,
      updatedAt: data.updated_at
    };
  },
  
  async getArticles(filters: ContentFilter = {}): Promise<Article[]> {
    let query = supabase
      .from('content_articles')
      .select('*')
      .eq('published', true);
    
    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    if (filters.playerIds && filters.playerIds.length > 0) {
      query = query.overlaps('featured_player_ids', filters.playerIds);
    }
    
    if (filters.teamIds && filters.teamIds.length > 0) {
      query = query.overlaps('featured_team_ids', filters.teamIds);
    }
    
    // Apply sorting
    if (filters.sortBy === 'newest') {
      query = query.order('published_at', { ascending: false });
    } else if (filters.sortBy === 'popular') {
      query = query.order('views', { ascending: false });
    } else if (filters.sortBy === 'trending') {
      // For trending, we might want a more complex algorithm
      query = query.order('published_at', { ascending: false }).order('views', { ascending: false });
    } else {
      query = query.order('published_at', { ascending: false });
    }
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
    
    return data.map(article => ({
      id: article.id,
      title: article.title,
      author: article.author,
      authorAvatar: article.author_avatar,
      summary: article.summary,
      content: article.content,
      coverImage: article.cover_image,
      tags: article.tags,
      category: article.category as ArticleCategory,
      featuredPlayerIds: article.featured_player_ids,
      featuredTeamIds: article.featured_team_ids,
      views: article.views,
      likes: article.likes,
      comments: article.comments,
      published: article.published,
      publishedAt: article.published_at,
      updatedAt: article.updated_at
    }));
  },
  
  async getArticleById(articleId: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('content_articles')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (error) {
      console.error('Error fetching article:', error);
      return null;
    }
    
    // Increment view count
    await supabase
      .from('content_articles')
      .update({ views: data.views + 1 })
      .eq('id', articleId);
    
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      authorAvatar: data.author_avatar,
      summary: data.summary,
      content: data.content,
      coverImage: data.cover_image,
      tags: data.tags,
      category: data.category as ArticleCategory,
      featuredPlayerIds: data.featured_player_ids,
      featuredTeamIds: data.featured_team_ids,
      views: data.views + 1, // Increment locally for immediate UI update
      likes: data.likes,
      comments: data.comments,
      published: data.published,
      publishedAt: data.published_at,
      updatedAt: data.updated_at
    };
  },
  
  async likeArticle(articleId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('content_articles')
      .select('likes')
      .eq('id', articleId)
      .single();
    
    if (error) {
      console.error('Error fetching article likes:', error);
      return false;
    }
    
    const { error: updateError } = await supabase
      .from('content_articles')
      .update({ likes: data.likes + 1 })
      .eq('id', articleId);
    
    if (updateError) {
      console.error('Error updating article likes:', updateError);
      return false;
    }
    
    return true;
  },
  
  // Podcasts
  async getPodcasts(filters: ContentFilter = {}): Promise<Podcast[]> {
    let query = supabase
      .from('content_podcasts')
      .select('*')
      .eq('published', true);
    
    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    if (filters.playerIds && filters.playerIds.length > 0) {
      query = query.overlaps('featured_player_ids', filters.playerIds);
    }
    
    if (filters.teamIds && filters.teamIds.length > 0) {
      query = query.overlaps('featured_team_ids', filters.teamIds);
    }
    
    // Apply sorting
    if (filters.sortBy === 'newest') {
      query = query.order('published_at', { ascending: false });
    } else if (filters.sortBy === 'popular') {
      query = query.order('plays', { ascending: false });
    } else if (filters.sortBy === 'trending') {
      query = query.order('published_at', { ascending: false }).order('plays', { ascending: false });
    } else {
      query = query.order('published_at', { ascending: false });
    }
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching podcasts:', error);
      return [];
    }
    
    return data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      host: podcast.host,
      hostAvatar: podcast.host_avatar,
      description: podcast.description,
      audioUrl: podcast.audio_url,
      imageUrl: podcast.image_url,
      duration: podcast.duration,
      tags: podcast.tags,
      category: podcast.category as PodcastCategory,
      featuredPlayerIds: podcast.featured_player_ids,
      featuredTeamIds: podcast.featured_team_ids,
      plays: podcast.plays,
      likes: podcast.likes,
      comments: podcast.comments,
      published: podcast.published,
      publishedAt: podcast.published_at,
      updatedAt: podcast.updated_at
    }));
  },
  
  async getPodcastById(podcastId: string): Promise<Podcast | null> {
    const { data, error } = await supabase
      .from('content_podcasts')
      .select('*')
      .eq('id', podcastId)
      .single();
    
    if (error) {
      console.error('Error fetching podcast:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      host: data.host,
      hostAvatar: data.host_avatar,
      description: data.description,
      audioUrl: data.audio_url,
      imageUrl: data.image_url,
      duration: data.duration,
      tags: data.tags,
      category: data.category as PodcastCategory,
      featuredPlayerIds: data.featured_player_ids,
      featuredTeamIds: data.featured_team_ids,
      plays: data.plays,
      likes: data.likes,
      comments: data.comments,
      published: data.published,
      publishedAt: data.published_at,
      updatedAt: data.updated_at
    };
  },
  
  async incrementPodcastPlays(podcastId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('content_podcasts')
      .select('plays')
      .eq('id', podcastId)
      .single();
    
    if (error) {
      console.error('Error fetching podcast plays:', error);
      return false;
    }
    
    const { error: updateError } = await supabase
      .from('content_podcasts')
      .update({ plays: data.plays + 1 })
      .eq('id', podcastId);
    
    if (updateError) {
      console.error('Error updating podcast plays:', updateError);
      return false;
    }
    
    return true;
  },
  
  // Videos
  async getVideos(filters: ContentFilter = {}): Promise<Video[]> {
    let query = supabase
      .from('content_videos')
      .select('*')
      .eq('published', true);
    
    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    if (filters.playerIds && filters.playerIds.length > 0) {
      query = query.overlaps('featured_player_ids', filters.playerIds);
    }
    
    if (filters.teamIds && filters.teamIds.length > 0) {
      query = query.overlaps('featured_team_ids', filters.teamIds);
    }
    
    // Apply sorting
    if (filters.sortBy === 'newest') {
      query = query.order('published_at', { ascending: false });
    } else if (filters.sortBy === 'popular') {
      query = query.order('views', { ascending: false });
    } else if (filters.sortBy === 'trending') {
      query = query.order('published_at', { ascending: false }).order('views', { ascending: false });
    } else {
      query = query.order('published_at', { ascending: false });
    }
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
    
    return data.map(video => ({
      id: video.id,
      title: video.title,
      creator: video.creator,
      creatorAvatar: video.creator_avatar,
      description: video.description,
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url,
      duration: video.duration,
      tags: video.tags,
      category: video.category as VideoCategory,
      featuredPlayerIds: video.featured_player_ids,
      featuredTeamIds: video.featured_team_ids,
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      published: video.published,
      publishedAt: video.published_at,
      updatedAt: video.updated_at
    }));
  },
  
  async getVideoById(videoId: string): Promise<Video | null> {
    const { data, error } = await supabase
      .from('content_videos')
      .select('*')
      .eq('id', videoId)
      .single();
    
    if (error) {
      console.error('Error fetching video:', error);
      return null;
    }
    
    // Increment view count
    await supabase
      .from('content_videos')
      .update({ views: data.views + 1 })
      .eq('id', videoId);
    
    return {
      id: data.id,
      title: data.title,
      creator: data.creator,
      creatorAvatar: data.creator_avatar,
      description: data.description,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      tags: data.tags,
      category: data.category as VideoCategory,
      featuredPlayerIds: data.featured_player_ids,
      featuredTeamIds: data.featured_team_ids,
      views: data.views + 1, // Increment locally for immediate UI update
      likes: data.likes,
      comments: data.comments,
      published: data.published,
      publishedAt: data.published_at,
      updatedAt: data.updated_at
    };
  },
  
  // Forums
  async getForums(): Promise<Forum[]> {
    const { data, error } = await supabase
      .from('forums')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching forums:', error);
      return [];
    }
    
    return data.map(forum => ({
      id: forum.id,
      name: forum.name,
      description: forum.description,
      topics: forum.topics,
      posts: forum.posts,
      lastPostAt: forum.last_post_at,
      createdAt: forum.created_at
    }));
  },
  
  async getForumTopics(forumId: string, limit: number = 20, offset: number = 0): Promise<ForumTopic[]> {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('forum_id', forumId)
      .order('is_pinned', { ascending: false })
      .order('last_post_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching forum topics:', error);
      return [];
    }
    
    return data.map(topic => ({
      id: topic.id,
      forumId: topic.forum_id,
      title: topic.title,
      author: topic.author,
      authorAvatar: topic.author_avatar,
      posts: topic.posts,
      views: topic.views,
      lastPostAt: topic.last_post_at,
      createdAt: topic.created_at,
      isPinned: topic.is_pinned,
      isLocked: topic.is_locked
    }));
  },
  
  async getForumPosts(topicId: string, limit: number = 20, offset: number = 0): Promise<ForumPost[]> {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching forum posts:', error);
      return [];
    }
    
    // Increment topic view count
    await supabase
      .from('forum_topics')
      .select('views')
      .eq('id', topicId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('forum_topics')
            .update({ views: data.views + 1 })
            .eq('id', topicId);
        }
      });
    
    return data.map(post => ({
      id: post.id,
      topicId: post.topic_id,
      userId: post.user_id,
      userName: post.user_name,
      userAvatar: post.user_avatar,
      content: post.content,
      likes: post.likes,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));
  },
  
  async createForumTopic(topic: Omit<ForumTopic, 'id' | 'posts' | 'views' | 'lastPostAt' | 'createdAt' | 'isPinned' | 'isLocked'>, firstPost: string): Promise<ForumTopic | null> {
    const topicId = uuidv4();
    const postId = uuidv4();
    const now = new Date().toISOString();
    
    // Start a transaction
    const { error: topicError } = await supabase
      .from('forum_topics')
      .insert([{
        id: topicId,
        forum_id: topic.forumId,
        title: topic.title,
        author: topic.author,
        author_avatar: topic.authorAvatar,
        posts: 1,
        views: 0,
        last_post_at: now,
        created_at: now,
        is_pinned: false,
        is_locked: false
      }]);
    
    if (topicError) {
      console.error('Error creating forum topic:', topicError);
      return null;
    }
    
    // Create the first post
    const { error: postError } = await supabase
      .from('forum_posts')
      .insert([{
        id: postId,
        topic_id: topicId,
        user_id: topic.author, // Assuming author is the user ID
        user_name: topic.author,
        user_avatar: topic.authorAvatar,
        content: firstPost,
        likes: 0,
        created_at: now,
        updated_at: now
      }]);
    
    if (postError) {
      console.error('Error creating forum post:', postError);
      // Try to clean up the topic
      await supabase.from('forum_topics').delete().eq('id', topicId);
      return null;
    }
    
    // Update forum post count and last post date
    const { data: forumData, error: forumError } = await supabase
      .from('forums')
      .select('topics, posts')
      .eq('id', topic.forumId)
      .single();
    
    if (!forumError) {
      await supabase
        .from('forums')
        .update({
          topics: forumData.topics + 1,
          posts: forumData.posts + 1,
          last_post_at: now
        })
        .eq('id', topic.forumId);
    }
    
    return {
      id: topicId,
      forumId: topic.forumId,
      title: topic.title,
      author: topic.author,
      authorAvatar: topic.authorAvatar,
      posts: 1,
      views: 0,
      lastPostAt: now,
      createdAt: now,
      isPinned: false,
      isLocked: false
    };
  },
  
  async createForumPost(post: Omit<ForumPost, 'id' | 'likes' | 'createdAt'>, topicId: string, forumId: string): Promise<ForumPost | null> {
    const postId = uuidv4();
    const now = new Date().toISOString();
    
    // Create the post
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([{
        id: postId,
        topic_id: topicId,
        user_id: post.userId,
        user_name: post.userName,
        user_avatar: post.userAvatar,
        content: post.content,
        likes: 0,
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating forum post:', error);
      return null;
    }
    
    // Update topic post count and last post date
    await supabase
      .from('forum_topics')
      .select('posts')
      .eq('id', topicId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('forum_topics')
            .update({
              posts: data.posts + 1,
              last_post_at: now
            })
            .eq('id', topicId);
        }
      });
    
    // Update forum post count and last post date
    await supabase
      .from('forums')
      .select('posts')
      .eq('id', forumId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('forums')
            .update({
              posts: data.posts + 1,
              last_post_at: now
            })
            .eq('id', forumId);
        }
      });
    
    return {
      id: data.id,
      topicId: data.topic_id,
      userId: data.user_id,
      userName: data.user_name,
      userAvatar: data.user_avatar,
      content: data.content,
      likes: data.likes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  // User Profiles
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      location: data.location,
      joinedAt: data.joined_at,
      following: data.following,
      followers: data.followers,
      posts: data.posts,
      leagueIds: data.league_ids,
      favoriteTeams: data.favorite_teams,
      favoritePlayers: data.favorite_players
    };
  },
  
  async updateUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
    const updates: any = {};
    
    if (profile.username) updates.username = profile.username;
    if (profile.displayName) updates.display_name = profile.displayName;
    if (profile.avatarUrl) updates.avatar_url = profile.avatarUrl;
    if (profile.bio !== undefined) updates.bio = profile.bio;
    if (profile.location !== undefined) updates.location = profile.location;
    if (profile.leagueIds) updates.league_ids = profile.leagueIds;
    if (profile.favoriteTeams) updates.favorite_teams = profile.favoriteTeams;
    if (profile.favoritePlayers) updates.favorite_players = profile.favoritePlayers;
    
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', profile.id);
    
    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
    
    return true;
  },
  
  // Mock Data Generation
  getMockPosts(count: number = 10): Post[] {
    const posts: Post[] = [];
    
    for (let i = 0; i < count; i++) {
      const now = new Date();
      now.setHours(now.getHours() - Math.floor(Math.random() * 72));
      
      posts.push({
        id: `mock-post-${i}`,
        userId: `user-${Math.floor(Math.random() * 10) + 1}`,
        userName: `User ${Math.floor(Math.random() * 10) + 1}`,
        userAvatar: `https://i.pravatar.cc/150?u=user-${Math.floor(Math.random() * 10) + 1}`,
        content: this.getRandomPostContent(),
        mediaUrls: Math.random() > 0.7 ? [`https://picsum.photos/800/600?random=${i}`] : [],
        tags: this.getRandomTags(),
        linkedPlayers: [],
        linkedTeams: [],
        linkedLeagues: [],
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        createdAt: now.toISOString()
      });
    }
    
    return posts;
  },
  
  getMockArticles(count: number = 5): Article[] {
    const articles: Article[] = [];
    const categories = Object.values(ArticleCategory);
    
    for (let i = 0; i < count; i++) {
      const publishedDate = new Date();
      publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 30));
      
      articles.push({
        id: `mock-article-${i}`,
        title: this.getRandomArticleTitle(),
        author: `Author ${Math.floor(Math.random() * 5) + 1}`,
        authorAvatar: `https://i.pravatar.cc/150?u=author-${Math.floor(Math.random() * 5) + 1}`,
        summary: this.getRandomSummary(),
        content: this.getRandomArticleContent(),
        coverImage: `https://picsum.photos/1200/600?random=${i}`,
        tags: this.getRandomTags(),
        category: categories[Math.floor(Math.random() * categories.length)],
        featuredPlayerIds: [],
        featuredTeamIds: [],
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 50),
        published: true,
        publishedAt: publishedDate.toISOString()
      });
    }
    
    return articles;
  },
  
  getMockPodcasts(count: number = 5): Podcast[] {
    const podcasts: Podcast[] = [];
    const categories = Object.values(PodcastCategory);
    
    for (let i = 0; i < count; i++) {
      const publishedDate = new Date();
      publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 14));
      
      podcasts.push({
        id: `mock-podcast-${i}`,
        title: this.getRandomPodcastTitle(),
        host: `Host ${Math.floor(Math.random() * 5) + 1}`,
        hostAvatar: `https://i.pravatar.cc/150?u=host-${Math.floor(Math.random() * 5) + 1}`,
        description: this.getRandomSummary(),
        audioUrl: 'https://example.com/podcast-audio.mp3',
        imageUrl: `https://picsum.photos/400/400?random=${i}`,
        duration: Math.floor(Math.random() * 3600) + 1800, // 30-90 mins
        tags: this.getRandomTags(),
        category: categories[Math.floor(Math.random() * categories.length)],
        featuredPlayerIds: [],
        featuredTeamIds: [],
        plays: Math.floor(Math.random() * 500),
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 25),
        published: true,
        publishedAt: publishedDate.toISOString()
      });
    }
    
    return podcasts;
  },
  
  getMockVideos(count: number = 5): Video[] {
    const videos: Video[] = [];
    const categories = Object.values(VideoCategory);
    
    for (let i = 0; i < count; i++) {
      const publishedDate = new Date();
      publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 21));
      
      videos.push({
        id: `mock-video-${i}`,
        title: this.getRandomVideoTitle(),
        creator: `Creator ${Math.floor(Math.random() * 5) + 1}`,
        creatorAvatar: `https://i.pravatar.cc/150?u=creator-${Math.floor(Math.random() * 5) + 1}`,
        description: this.getRandomSummary(),
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: `https://picsum.photos/1280/720?random=${i}`,
        duration: Math.floor(Math.random() * 600) + 300, // 5-15 mins
        tags: this.getRandomTags(),
        category: categories[Math.floor(Math.random() * categories.length)],
        featuredPlayerIds: [],
        featuredTeamIds: [],
        views: Math.floor(Math.random() * 2000),
        likes: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 50),
        published: true,
        publishedAt: publishedDate.toISOString()
      });
    }
    
    return videos;
  },
  
  getMockForums(): Forum[] {
    return [
      {
        id: 'forum-1',
        name: 'Dynasty Strategy',
        description: 'Discuss long-term dynasty fantasy football strategies',
        topics: 34,
        posts: 342,
        lastPostAt: new Date().toISOString(),
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'forum-2',
        name: 'Rookie Talk',
        description: 'All about rookie prospects and drafts',
        topics: 21,
        posts: 189,
        lastPostAt: new Date().toISOString(),
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'forum-3',
        name: 'Trade Analysis',
        description: 'Get your trades analyzed by the community',
        topics: 56,
        posts: 412,
        lastPostAt: new Date().toISOString(),
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'forum-4',
        name: 'Player Discussion',
        description: 'Deep dives on specific players',
        topics: 78,
        posts: 624,
        lastPostAt: new Date().toISOString(),
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'forum-5',
        name: 'Commissioner Corner',
        description: 'Questions and advice for fantasy commissioners',
        topics: 15,
        posts: 98,
        lastPostAt: new Date().toISOString(),
        createdAt: '2023-01-01T00:00:00Z'
      }
    ];
  },
  
  // Helper methods for mock data
  getRandomPostContent(): string {
    const contents = [
      "Just traded for CeeDee Lamb. Thoughts on his dynasty value moving forward?",
      "Which rookie QB has the best chance to succeed this year?",
      "Is it time to sell high on Derrick Henry or ride him into the sunset?",
      "My team is clearly rebuilding. What veterans should I target that might be undervalued?",
      "Which second-year WR are you most excited about this season?",
      "Just had an amazing dynasty startup draft! Let me know what you think of my team.",
      "What's a fair trade value for the 1.01 pick in rookie drafts this year?",
      "Anyone concerned about Jonathan Taylor's usage going forward?",
      "Is Kyle Pitts still worth the investment in dynasty?",
      "Best strategy for approaching a rebuild in dynasty - slow burn or fire sale?"
    ];
    return contents[Math.floor(Math.random() * contents.length)];
  },
  
  getRandomArticleTitle(): string {
    const titles = [
      "Top 10 Dynasty Sleepers for 2023",
      "Rookie Draft Strategy Guide",
      "Quarterback Dynasty Rankings Updated",
      "Trading Strategy for Rebuilding Teams",
      "How to Identify Breakout Candidates Before Anyone Else",
      "Dynasty Buy Low, Sell High: Summer Edition",
      "The Truth About Rookie Running Backs in Fantasy",
      "Long-term Value: Building a Dynasty That Lasts",
      "Contender's Guide to In-Season Trades",
      "Age Curves and How They Affect Dynasty Value"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  },
  
  getRandomPodcastTitle(): string {
    const titles = [
      "Dynasty Roundtable: Rookie Draft Preview",
      "The Waiver Wire: Hidden Gems",
      "Trading Post: Negotiation Tactics",
      "Player Spotlight: Rising Stars",
      "Rookie Review: Post-Draft Analysis",
      "Strategy Session: Building Through the Draft",
      "Dynasty Debates: Youth vs Experience",
      "Market Watch: Value Shifts",
      "Contender's Corner: Win-Now Moves",
      "The Long Game: Rebuilding Strategies"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  },
  
  getRandomVideoTitle(): string {
    const titles = [
      "Film Breakdown: Why This Rookie RB Will Be Special",
      "Dynasty Trade Tips: How to Get the Best Value",
      "Rookie Class Deep Dive: Sleepers and Busts",
      "Player Comparison: Next Gen Stats Analysis",
      "Dynasty Startup Draft Strategy",
      "How to Evaluate Talent for Dynasty Leagues",
      "Breaking Down the Top 5 WR Prospects",
      "Dynasty League Roster Construction Guide",
      "NFL Draft Winners and Losers for Dynasty",
      "Advanced Metrics for Dynasty Success"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  },
  
  getRandomSummary(): string {
    const summaries = [
      "A comprehensive look at emerging talents in dynasty leagues and how to acquire them before their value skyrockets.",
      "Exploring the strategies that consistently lead to dynasty success, with insights from top players.",
      "Breaking down the film on this year's rookie class to separate the hype from reality.",
      "An analytical approach to player evaluation using advanced metrics and opportunity-based analysis.",
      "How to balance win-now moves with long-term stability in your dynasty roster construction."
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  },
  
  getRandomArticleContent(): string {
    return `
      <h2>Introduction</h2>
      <p>Dynasty fantasy football requires a different mindset than redraft leagues. The decisions you make can impact your team for years to come, making each trade, draft pick, and waiver wire addition that much more important.</p>
      
      <h2>Key Strategies</h2>
      <p>The best dynasty managers are always thinking multiple steps ahead. While it's important to compete for championships, you also need to keep an eye on the future and maintain a balanced roster that can sustain success.</p>
      
      <h3>Value-Based Approach</h3>
      <p>Always look for value in every transaction. Sometimes this means trading away a player you like if the return is too good to pass up. Other times it means holding onto a depreciating asset because the market has overreacted to recent news.</p>
      
      <h3>Age Considerations</h3>
      <p>Generally, younger players hold more long-term value in dynasty formats. However, don't fall into the trap of overvaluing youth at the expense of production. A 28-year-old stud can still provide several years of elite production.</p>
      
      <h2>Position-Specific Strategies</h2>
      <p>Different positions age differently and have different value curves in dynasty leagues:</p>
      
      <h3>Quarterbacks</h3>
      <p>Elite QBs can provide value well into their 30s. In superflex formats, they become even more valuable. Don't hesitate to invest in young promising quarterbacks with rushing upside.</p>
      
      <h3>Running Backs</h3>
      <p>The most volatile position with the shortest shelf life. Running backs typically peak earlier and decline faster than other positions. Be willing to trade RBs approaching age 26-27 unless you're in a championship window.</p>
      
      <h3>Wide Receivers</h3>
      <p>Often the backbone of dynasty teams due to their longer career trajectories. Elite receivers can produce well into their early 30s, making them solid long-term investments.</p>
      
      <h3>Tight Ends</h3>
      <p>The position with the steepest learning curve. Young tight ends rarely produce immediately but can become valuable assets by their third season. Patience is key with this position.</p>
      
      <h2>Conclusion</h2>
      <p>Success in dynasty leagues comes from balancing short-term competitiveness with long-term sustainability. Always be active in managing your roster, stay informed on player news, and don't be afraid to make bold moves when the value is right.</p>
    `;
  },
  
  getRandomTags(): string[] {
    const allTags = [
      'dynasty', 'rookie', 'sleeper', 'trade', 'draft', 'strategy', 'QB', 'RB', 'WR', 'TE',
      'startup', 'rebuild', 'contender', 'waiver', 'superflex', 'TEpremium', 'PPR', 'analysis'
    ];
    
    const numTags = Math.floor(Math.random() * 4) + 1; // 1-4 tags
    const tags: string[] = [];
    
    for (let i = 0; i < numTags; i++) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(randomTag)) {
        tags.push(randomTag);
      }
    }
    
    return tags;
  }
};

export default SocialService;