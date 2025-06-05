import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog';
import {
  ArrowUp,
  BookOpen,
  Calendar,
  ChevronDown,
  Clock,
  Dot,
  FileText,
  Film,
  Heart,
  ImagePlus,
  Loader2,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Music,
  PenBox,
  PlayCircle,
  Plus,
  Search,
  Send,
  Share2,
  TagIcon,
  ThumbsUp,
  Trash,
  Users,
  User as UserIcon
} from 'lucide-react';
import SocialService, {
  Post,
  Comment,
  Article,
  Podcast,
  Video,
  Forum,
  ForumTopic,
  ArticleCategory,
  PodcastCategory,
  VideoCategory,
  ContentFilter
} from '../../services/SocialService';
import { format, formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Link } from 'react-router-dom';

interface SocialHubProps {
  initialTab?: 'feed' | 'articles' | 'podcasts' | 'videos' | 'forums';
}

const SocialHub: React.FC<SocialHubProps> = ({ initialTab = 'feed' }) => {
  // State for content
  const [posts, setPosts] = useState<Post[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  
  // State for UI
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<string[]>([]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // Get current user from Redux store
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // For now, use mock data
        setPosts(SocialService.getMockPosts(15));
        setArticles(SocialService.getMockArticles(12));
        setPodcasts(SocialService.getMockPodcasts(8));
        setVideos(SocialService.getMockVideos(10));
        setForums(SocialService.getMockForums());
      } catch (error) {
        console.error('Error fetching social content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle sorting change
  useEffect(() => {
    // For now, just simulate sorting with mock data
    const sortMockData = () => {
      if (activeSort === 'newest') {
        setPosts([...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setArticles([...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
        setPodcasts([...podcasts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
        setVideos([...videos].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      } else if (activeSort === 'popular') {
        setPosts([...posts].sort((a, b) => b.likes - a.likes));
        setArticles([...articles].sort((a, b) => b.views - a.views));
        setPodcasts([...podcasts].sort((a, b) => b.plays - a.plays));
        setVideos([...videos].sort((a, b) => b.views - a.views));
      } else if (activeSort === 'trending') {
        // Simple trending algorithm - combination of recency and popularity
        setPosts([...posts].sort((a, b) => {
          const aScore = a.likes + a.comments * 2 - (Date.now() - new Date(a.createdAt).getTime()) / 3600000;
          const bScore = b.likes + b.comments * 2 - (Date.now() - new Date(b.createdAt).getTime()) / 3600000;
          return bScore - aScore;
        }));
        setArticles([...articles].sort((a, b) => {
          const aScore = a.views - (Date.now() - new Date(a.publishedAt).getTime()) / 3600000;
          const bScore = b.views - (Date.now() - new Date(b.publishedAt).getTime()) / 3600000;
          return bScore - aScore;
        }));
        setPodcasts([...podcasts].sort((a, b) => {
          const aScore = a.plays - (Date.now() - new Date(a.publishedAt).getTime()) / 3600000;
          const bScore = b.plays - (Date.now() - new Date(a.publishedAt).getTime()) / 3600000;
          return bScore - aScore;
        }));
        setVideos([...videos].sort((a, b) => {
          const aScore = a.views - (Date.now() - new Date(a.publishedAt).getTime()) / 3600000;
          const bScore = b.views - (Date.now() - new Date(a.publishedAt).getTime()) / 3600000;
          return bScore - aScore;
        }));
      }
    };
    
    sortMockData();
  }, [activeSort]);
  
  // Handle filtering by category
  useEffect(() => {
    const filterByCategory = () => {
      if (activeCategory === 'all') {
        // Reset to full list
        setPosts(SocialService.getMockPosts(15));
        setArticles(SocialService.getMockArticles(12));
        setPodcasts(SocialService.getMockPodcasts(8));
        setVideos(SocialService.getMockVideos(10));
      } else {
        // Filter based on category
        // For articles, podcasts, videos, we'd filter by their category field
        // For posts, we'd filter by tags
        
        // Just simulating this behavior for now
        setPosts(SocialService.getMockPosts(5).filter(p => p.tags?.includes(activeCategory.toLowerCase())));
        setArticles(SocialService.getMockArticles(5).filter(a => a.category === activeCategory));
        setPodcasts(SocialService.getMockPodcasts(3).filter(p => p.category === activeCategory));
        setVideos(SocialService.getMockVideos(4).filter(v => v.category === activeCategory));
      }
    };
    
    filterByCategory();
  }, [activeCategory]);
  
  // Handle creating a post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentUser) return;
    
    try {
      // In a real app, you'd use the SocialService to create a post
      // For now, just simulate creating a post
      const newPost: Post = {
        id: `new-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.displayName || currentUser.username,
        userAvatar: currentUser.avatarUrl,
        content: newPostContent,
        mediaUrls: newPostMedia,
        tags: extractTags(newPostContent),
        linkedPlayers: [],
        linkedTeams: [],
        linkedLeagues: [],
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString()
      };
      
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setNewPostMedia([]);
      setIsCreatePostModalOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  
  // Handle liking a post
  const handleLikePost = async (postId: string) => {
    try {
      // In a real app, you'd use the SocialService to like a post
      // For now, just simulate liking a post
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 } 
          : post
      ));
      
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  // Handle deleting a post
  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      // In a real app, you'd use the SocialService to delete a post
      // For now, just simulate deleting a post
      setPosts(posts.filter(post => post.id !== selectedPost.id));
      setSelectedPost(null);
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  // Handle adding a comment to a post
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPost || !currentUser) return;
    
    try {
      // In a real app, you'd use the SocialService to add a comment
      // For now, just simulate adding a comment
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        postId: selectedPost.id,
        userId: currentUser.id,
        userName: currentUser.displayName || currentUser.username,
        userAvatar: currentUser.avatarUrl,
        content: commentText,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      
      setComments([...comments, newComment]);
      setCommentText('');
      
      // Update comment count on the post
      setPosts(posts.map(post => 
        post.id === selectedPost.id 
          ? { ...post, comments: post.comments + 1 } 
          : post
      ));
      
      setSelectedPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  // Load comments for a post
  const loadComments = async (post: Post) => {
    setSelectedPost(post);
    setComments([]);
    
    try {
      // In a real app, you'd use the SocialService to fetch comments
      // For now, just simulate fetching comments
      setTimeout(() => {
        const mockComments: Comment[] = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
          id: `comment-${post.id}-${i}`,
          postId: post.id,
          userId: `user-${Math.floor(Math.random() * 10) + 1}`,
          userName: `Commenter ${Math.floor(Math.random() * 10) + 1}`,
          userAvatar: `https://i.pravatar.cc/150?u=commenter-${Math.floor(Math.random() * 10) + 1}`,
          content: getRandomComment(),
          likes: Math.floor(Math.random() * 5),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
        }));
        
        setComments(mockComments);
      }, 500);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };
  
  // Handle viewing an article
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
  };
  
  // Handle playing a podcast
  const handlePlayPodcast = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
  };
  
  // Handle watching a video
  const handleWatchVideo = (video: Video) => {
    setSelectedVideo(video);
  };
  
  // Extract hashtags from text
  const extractTags = (text: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[1].toLowerCase());
    }
    
    return tags;
  };
  
  // Random comment generator for mock data
  const getRandomComment = (): string => {
    const comments = [
      "Great point! I completely agree with your take.",
      "I'm not so sure about this. Have you considered the other side?",
      "This is the content I come here for. Always insightful!",
      "Interesting perspective. I hadn't thought about it that way.",
      "Thanks for sharing! Really valuable information.",
      "I've had a similar experience with this player.",
      "Can't wait to see how this plays out in the upcoming season.",
      "I'm definitely implementing this strategy in my league.",
      "What about the impact of injuries on this analysis?",
      "Have you looked at the historical data on this? Curious to see the trends."
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  };
  
  // Format timestamp into relative time
  const formatTime = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };
  
  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Render post card
  const renderPostCard = (post: Post) => (
    <Card key={post.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={post.userAvatar} alt={post.userName} />
              <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{post.userName}</h3>
              <p className="text-xs text-gray-500">{formatTime(post.createdAt)}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.content)}>
                Copy Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/post/${post.id}`, '_blank')}>
                Open in New Tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {post.userId === currentUser?.id && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    setSelectedPost(post);
                    setIsDeleteAlertOpen(true);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="whitespace-pre-line mb-2">{post.content}</p>
        
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="my-2">
            {post.mediaUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="Post media"
                className="rounded-md max-h-96 w-full object-cover"
              />
            ))}
          </div>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full text-sm text-gray-500">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => handleLikePost(post.id)}
          >
            <Heart className={`h-4 w-4 ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{post.likes > 0 ? post.likes : 'Like'}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => loadComments(post)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments > 0 ? post.comments : 'Comment'}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span>{post.shares > 0 ? post.shares : 'Share'}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  
  // Render article card
  const renderArticleCard = (article: Article) => (
    <Card key={article.id} className="mb-4 overflow-hidden">
      <div className="relative aspect-video">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <Badge className="mb-2">{article.category}</Badge>
          <h3 className="text-xl font-bold">{article.title}</h3>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={article.authorAvatar} alt={article.author} />
              <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{article.author}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(article.publishedAt), 'MMM d, yyyy')}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 py-2">
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {article.views}
            </div>
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {article.likes}
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              {article.comments}
            </div>
          </div>
          
          <Button size="sm" onClick={() => handleViewArticle(article)}>
            Read Article
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  
  // Render podcast card
  const renderPodcastCard = (podcast: Podcast) => (
    <Card key={podcast.id} className="mb-4">
      <div className="flex items-center p-4">
        <div className="relative mr-4 flex-shrink-0">
          <img
            src={podcast.imageUrl || 'https://placehold.co/200x200?text=Podcast'}
            alt={podcast.title}
            className="w-24 h-24 rounded-md object-cover"
          />
          <button 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md"
            onClick={() => handlePlayPodcast(podcast)}
          >
            <PlayCircle className="h-10 w-10 text-white" />
          </button>
        </div>
        
        <div className="flex-grow">
          <Badge className="mb-1">{podcast.category}</Badge>
          <h3 className="font-semibold line-clamp-1">{podcast.title}</h3>
          
          <div className="flex items-center text-sm text-gray-500 mt-1 mb-2">
            <span className="flex items-center mr-3">
              <UserIcon className="h-3 w-3 mr-1" />
              {podcast.host}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(podcast.duration)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">{podcast.description}</p>
        </div>
      </div>
      
      <CardFooter className="border-t bg-gray-50 py-2">
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center">
              <PlayCircle className="h-3 w-3 mr-1" />
              {podcast.plays} plays
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(podcast.publishedAt), 'MMM d, yyyy')}
            </div>
          </div>
          
          <Button size="sm" onClick={() => handlePlayPodcast(podcast)}>
            Listen Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  
  // Render video card
  const renderVideoCard = (video: Video) => (
    <Card key={video.id} className="mb-4 overflow-hidden">
      <div className="relative aspect-video">
        <img
          src={video.thumbnailUrl || 'https://placehold.co/640x360?text=Video'}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <button 
            className="h-16 w-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center"
            onClick={() => handleWatchVideo(video)}
          >
            <PlayCircle className="h-10 w-10 text-primary" />
          </button>
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-1">{video.category}</Badge>
            <h3 className="font-semibold line-clamp-2">{video.title}</h3>
          </div>
        </div>
        
        <div className="flex items-center mt-2 mb-3">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={video.creatorAvatar} alt={video.creator} />
            <AvatarFallback>{video.creator.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{video.creator}</span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 py-2">
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {video.views} views
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(video.publishedAt), 'MMM d, yyyy')}
            </div>
          </div>
          
          <Button size="sm" onClick={() => handleWatchVideo(video)}>
            Watch Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  
  // Render forum card
  const renderForumCard = (forum: Forum) => (
    <Card key={forum.id} className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{forum.name}</CardTitle>
        <CardDescription>{forum.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm">
          <div className="flex gap-4">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1 text-gray-500" />
              <span>{forum.topics} Topics</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1 text-gray-500" />
              <span>{forum.posts} Posts</span>
            </div>
          </div>
          <div className="text-gray-500 text-xs flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last post {formatTime(forum.lastPostAt)}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/forums/${forum.id}`}>
            View Forum
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
  
  // Render comment section
  const renderComments = () => {
    if (!selectedPost) return null;
    
    return (
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>
              Discussing {selectedPost.content.substring(0, 50)}...
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="font-medium">{comment.userName}</div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Button variant="ghost" size="sm" className="h-auto p-0 px-1">
                          <Heart className="h-3 w-3 mr-1" />
                          Like
                        </Button>
                        <Dot className="h-4 w-4" />
                        <span>{formatTime(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </ScrollArea>
          
          <div className="flex items-start gap-2 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.displayName} />
              <AvatarFallback>{currentUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render article view
  const renderArticleView = () => {
    if (!selectedArticle) return null;
    
    return (
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2">{selectedArticle.category}</Badge>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedArticle(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedArticle.authorAvatar} alt={selectedArticle.author} />
                  <AvatarFallback>{selectedArticle.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{selectedArticle.author}</span>
                <Dot className="h-4 w-4" />
                <span>{format(new Date(selectedArticle.publishedAt), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {selectedArticle.views}
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {selectedArticle.likes}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {selectedArticle.comments}
                </span>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {selectedArticle.coverImage && (
              <div className="relative mb-4">
                <img
                  src={selectedArticle.coverImage}
                  alt={selectedArticle.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}
            
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
            
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-6">
                {selectedArticle.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="border-t pt-4 mt-4">
            <Button variant="outline" className="mr-auto">
              Share Article
            </Button>
            <Button>Add to Favorites</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render podcast player
  const renderPodcastPlayer = () => {
    if (!selectedPodcast) return null;
    
    return (
      <Dialog open={!!selectedPodcast} onOpenChange={() => setSelectedPodcast(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-3">
                <img
                  src={selectedPodcast.imageUrl || 'https://placehold.co/200x200?text=Podcast'}
                  alt={selectedPodcast.title}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div>
                  <Badge className="mb-1">{selectedPodcast.category}</Badge>
                  <h3 className="text-xl">{selectedPodcast.title}</h3>
                  <p className="text-gray-500 text-sm">{selectedPodcast.host}</p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm">{selectedPodcast.description}</p>
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-3 text-gray-500">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(selectedPodcast.duration)}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(selectedPodcast.publishedAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4 mr-1" />
                {selectedPodcast.plays} plays
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between text-white mb-2">
                <span>0:00</span>
                <span>{formatDuration(selectedPodcast.duration)}</span>
              </div>
              
              <div className="w-full bg-gray-600 rounded-full h-1 mb-4">
                <div className="bg-primary h-1 rounded-full w-0"></div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="ghost" size="icon" className="text-white">
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button size="icon" className="text-white bg-primary hover:bg-primary/90 h-12 w-12">
                  <Play className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white">
                  <SkipForward className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="mr-auto">
              Share Episode
            </Button>
            <Button variant="default">
              Subscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render video player
  const renderVideoPlayer = () => {
    if (!selectedVideo) return null;
    
    return (
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo.title}</DialogTitle>
          </DialogHeader>
          
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Play className="h-16 w-16 text-white mx-auto" />
              <p className="text-white mt-2">Video player would appear here</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedVideo.creatorAvatar} alt={selectedVideo.creator} />
              <AvatarFallback>{selectedVideo.creator.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{selectedVideo.creator}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {selectedVideo.views} views
                <Dot className="h-4 w-4" />
                {format(new Date(selectedVideo.publishedAt), 'MMM d, yyyy')}
              </p>
            </div>
            <Button className="ml-auto">Subscribe</Button>
          </div>
          
          <Separator />
          
          <div className="mt-4">
            <div className="flex gap-4 mb-4">
              <Button variant="outline" className="flex-1">
                <ThumbsUp className="h-4 w-4 mr-2" />
                {selectedVideo.likes}
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">{selectedVideo.description}</p>
              
              {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {selectedVideo.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render delete confirmation
  const renderDeleteAlert = () => (
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeletePost} className="bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  
  // Render content based on active tab
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    switch (activeTab) {
      case 'feed':
        return (
          <div>
            <div className="mb-6">
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.displayName} />
                      <AvatarFallback>{currentUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-gray-500 font-normal h-10"
                        onClick={() => setIsCreatePostModalOpen(true)}
                      >
                        What's on your mind?
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {posts.map(post => renderPostCard(post))}
            </div>
          </div>
        );
      
      case 'articles':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map(article => renderArticleCard(article))}
          </div>
        );
      
      case 'podcasts':
        return (
          <div>
            {podcasts.map(podcast => renderPodcastCard(podcast))}
          </div>
        );
      
      case 'videos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map(video => renderVideoCard(video))}
          </div>
        );
      
      case 'forums':
        return (
          <div>
            {forums.map(forum => renderForumCard(forum))}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dynasty Community Hub</h1>
        <p className="text-gray-600">
          Connect with the dynasty fantasy football community, share insights, and access premium content
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-64 flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-1">
                <Button
                  variant={activeCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveCategory('all')}
                >
                  All Categories
                </Button>
                
                {activeTab === 'feed' && (
                  <>
                    <Button
                      variant={activeCategory === 'dynasty' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('dynasty')}
                    >
                      Dynasty Strategy
                    </Button>
                    <Button
                      variant={activeCategory === 'rookie' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('rookie')}
                    >
                      Rookie Talk
                    </Button>
                    <Button
                      variant={activeCategory === 'trade' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('trade')}
                    >
                      Trade Discussion
                    </Button>
                    <Button
                      variant={activeCategory === 'sleeper' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('sleeper')}
                    >
                      Sleeper Picks
                    </Button>
                  </>
                )}
                
                {activeTab === 'articles' && (
                  <>
                    {Object.values(ArticleCategory).map(category => (
                      <Button
                        key={category}
                        variant={activeCategory === category ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveCategory(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </>
                )}
                
                {activeTab === 'podcasts' && (
                  <>
                    {Object.values(PodcastCategory).map(category => (
                      <Button
                        key={category}
                        variant={activeCategory === category ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveCategory(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </>
                )}
                
                {activeTab === 'videos' && (
                  <>
                    {Object.values(VideoCategory).map(category => (
                      <Button
                        key={category}
                        variant={activeCategory === category ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveCategory(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
            
            <Separator className="mb-2" />
            
            <CardHeader className="pb-2">
              <CardTitle>Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm('#dynasty')}
                >
                  #dynasty
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm('#rookie')}
                >
                  #rookie
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm('#trade')}
                >
                  #trade
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm('#sleeper')}
                >
                  #sleeper
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm('#strategy')}
                >
                  #strategy
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm('#superflex')}
                >
                  #superflex
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList>
                <TabsTrigger value="feed">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feed
                </TabsTrigger>
                <TabsTrigger value="articles">
                  <FileText className="h-4 w-4 mr-2" />
                  Articles
                </TabsTrigger>
                <TabsTrigger value="podcasts">
                  <Music className="h-4 w-4 mr-2" />
                  Podcasts
                </TabsTrigger>
                <TabsTrigger value="videos">
                  <Film className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
                <TabsTrigger value="forums">
                  <Users className="h-4 w-4 mr-2" />
                  Forums
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <div className="relative w-56">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <TagIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end" className="p-0 w-56">
                  <div className="p-2">
                    <Label className="text-xs font-semibold">Filter by Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setSearchTerm('#dynasty')}
                      >
                        #dynasty
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setSearchTerm('#rookie')}
                      >
                        #rookie
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setSearchTerm('#trade')}
                      >
                        #trade
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setSearchTerm('#sleeper')}
                      >
                        #sleeper
                      </Badge>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {activeSort === 'newest' ? 'Newest' : activeSort === 'popular' ? 'Popular' : 'Trending'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveSort('newest')}>
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Newest</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveSort('popular')}>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    <span>Popular</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveSort('trending')}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    <span>Trending</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {activeTab === 'feed' && (
                <Button onClick={() => setIsCreatePostModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              )}
            </div>
          </div>
          
          {renderContent()}
        </div>
      </div>
      
      {/* Dialogs and modals */}
      {renderComments()}
      {renderArticleView()}
      {renderPodcastPlayer()}
      {renderVideoPlayer()}
      {renderDeleteAlert()}
      
      {/* Create post modal */}
      <Dialog open={isCreatePostModalOpen} onOpenChange={setIsCreatePostModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>
              Share your thoughts with the dynasty community
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 mb-4">
            <Avatar>
              <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.displayName} />
              <AvatarFallback>{currentUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{currentUser?.displayName || 'Anonymous'}</p>
              <p className="text-xs text-gray-500">Posting publicly</p>
            </div>
          </div>
          
          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[120px]"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          
          {newPostMedia.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {newPostMedia.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt="Post media" className="rounded-md h-24 w-full object-cover" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-black bg-opacity-50 text-white"
                    onClick={() => setNewPostMedia(newPostMedia.filter((_, i) => i !== index))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // In a real app, you'd use a file picker here
                  setNewPostMedia([
                    ...newPostMedia, 
                    `https://picsum.photos/800/600?random=${Date.now()}`
                  ]);
                }}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              
              <Button variant="ghost" size="sm">
                <TagIcon className="h-4 w-4 mr-2" />
                Tag
              </Button>
            </div>
            
            <Button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
            >
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialHub;