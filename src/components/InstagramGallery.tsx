import React, { useState, useEffect } from 'react';
import {
  INSTAGRAM_PROFILE,
  InstagramCollageItem,
  getStoredInstagramPosts,
  performHourlySync,
  initInstagramHourlySync,
  getLastSyncTime,
} from '../services/instagramService';
import {
  Instagram,
  Heart,
  MessageCircle,
  ExternalLink,
  X,
  RefreshCw,
  Clock,
  Sparkles,
  Scissors,
  CheckCircle,
  Calendar,
  Layers,
  Play,
  UserCheck,
  Send,
  Bell,
  MoreHorizontal,
  Bookmark,
  Share2,
  Phone,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react';

interface InstagramGalleryProps {
  onSelectModelForBooking?: (styleName: string) => void;
}

export const InstagramGallery: React.FC<InstagramGalleryProps> = ({ onSelectModelForBooking }) => {
  const [posts, setPosts] = useState<InstagramCollageItem[]>(() => getStoredInstagramPosts());
  const [activeSubTab, setActiveSubTab] = useState<'grid' | 'reels' | 'tagged'>('grid');
  const [selectedPost, setSelectedPost] = useState<InstagramCollageItem | null>(null);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState(true);

  const toggleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleBookModel = (post: InstagramCollageItem) => {
    setSelectedPost(null);
    if (onSelectModelForBooking) {
      onSelectModelForBooking(post.haircutStyle);
    } else {
      const bookingEl = document.getElementById('online-randevu');
      if (bookingEl) {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="instagram-galeri" className="py-8 sm:py-12 bg-slate-950 text-white relative">
      <div className="mx-auto max-w-4xl px-3 sm:px-6">
        
        {/* Instagram In-App Mockup Card */}
        <div className="rounded-3xl bg-black border border-slate-800/90 shadow-2xl overflow-hidden">
          
          {/* Top IG Nav Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-black/80 backdrop-blur sticky top-0 z-10">
            <a
              href={INSTAGRAM_PROFILE.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Instagram className="w-5 h-5 text-rose-500" />
              <span className="font-bold text-sm tracking-tight text-white">
                {INSTAGRAM_PROFILE.username}
              </span>
            </a>

            <div className="flex items-center gap-3 text-slate-300">
              <a
                href={INSTAGRAM_PROFILE.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-white"
                title="Instagram'da Aç"
              >
                <Bell className="w-4 h-4" />
              </a>
              <a
                href={INSTAGRAM_PROFILE.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-white"
                title="Seçenekler"
              >
                <MoreHorizontal className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Profile Header (Exact match to screenshot) */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-6 sm:gap-10">
              {/* Profile Avatar with Story Gradient Ring */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                  <img
                    src={INSTAGRAM_PROFILE.avatarUrl}
                    alt={INSTAGRAM_PROFILE.displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover border-2 border-black"
                  />
                </div>
              </div>

              {/* Stats Counters */}
              <div className="flex-1 flex items-center justify-around text-center">
                <div>
                  <div className="text-base sm:text-lg font-bold text-white font-mono leading-tight">
                    {INSTAGRAM_PROFILE.postsCount}
                  </div>
                  <div className="text-[11px] text-slate-400">gönderi</div>
                </div>

                <div>
                  <div className="text-base sm:text-lg font-bold text-white font-mono leading-tight">
                    {INSTAGRAM_PROFILE.followersCount}
                  </div>
                  <div className="text-[11px] text-slate-400">takipçi</div>
                </div>

                <div>
                  <div className="text-base sm:text-lg font-bold text-white font-mono leading-tight">
                    {INSTAGRAM_PROFILE.followingCount}
                  </div>
                  <div className="text-[11px] text-slate-400">takip</div>
                </div>
              </div>
            </div>

            {/* Display Name & Bio */}
            <div className="space-y-1 text-xs">
              <h1 className="font-extrabold text-sm text-white">
                {INSTAGRAM_PROFILE.displayName}
              </h1>

              {INSTAGRAM_PROFILE.bioLines.map((line, idx) => (
                <p key={idx} className="text-slate-200">
                  {line}
                </p>
              ))}

              {/* WhatsApp Bio Link */}
              <a
                href={INSTAGRAM_PROFILE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 font-medium pt-0.5"
              >
                <span>🔗</span>
                <span>wa.me/905316605230</span>
              </a>

              {/* Badges / Links (Tarık Fulya & WhatsApp) */}
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                  <span className="text-blue-500 font-bold">f</span>
                  <span>Tarık Fulya</span>
                </span>

                <a
                  href={INSTAGRAM_PROFILE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-900/60 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Social Proof Line */}
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="inline-block h-4 w-4 rounded-full ring-1 ring-black bg-slate-700 overflow-hidden">
                    <img
                      src="/src/assets/images/ig_post_tarik_customer_1791055960103.jpg"
                      alt="follower"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="inline-block h-4 w-4 rounded-full ring-1 ring-black bg-slate-600 overflow-hidden">
                    <img
                      src="/src/assets/images/barber_master_ahmet_1791041628892.jpg"
                      alt="follower"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="truncate">
                  <strong className="text-white font-medium">adem_snltrk</strong> ve{' '}
                  <strong className="text-white font-medium">tarik_fulya</strong> takip ediyor
                </p>
              </div>
            </div>

            {/* Action Buttons: Takip, Mesaj, Randevu Al */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isFollowing
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isFollowing ? 'Takip Ediliyor ▾' : 'Takip Et'}
              </button>

              <a
                href={INSTAGRAM_PROFILE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Mesaj</span>
              </a>

              <a
                href={INSTAGRAM_PROFILE.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Instagram className="w-3 h-3" />
                <span>Profili Aç</span>
              </a>
            </div>
          </div>

          {/* Instagram 3-Tab Bar (Grid, Reels, Tagged) */}
          <div className="grid grid-cols-3 border-t border-slate-800 text-center text-xs">
            <button
              onClick={() => setActiveSubTab('grid')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeSubTab === 'grid'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="grid grid-cols-3 gap-0.5 w-3.5 h-3.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-current rounded-[0.5px]" />
                ))}
              </div>
              <span className="hidden sm:inline">Gönderiler (18)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('reels')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeSubTab === 'reels'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Reels</span>
            </button>

            <button
              onClick={() => setActiveSubTab('tagged')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeSubTab === 'tagged'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Etiketlenenler</span>
            </button>
          </div>

          {/* 3x3 Photo Grid (Exact layout from the real profile) */}
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 bg-black p-0.5">
            {posts.map((post) => {
              const isLiked = likedPosts.includes(post.id);

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="relative aspect-square group cursor-pointer overflow-hidden bg-slate-900"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Corner Badges matching Instagram */}
                  {post.postType === 'carousel' && (
                    <div className="absolute top-2 right-2 text-white/90 drop-shadow-md">
                      <Layers className="w-4 h-4" />
                    </div>
                  )}

                  {post.postType === 'video' && (
                    <div className="absolute top-2 right-2 text-white/90 drop-shadow-md">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                  )}

                  {post.isBeforeAfter && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      Before
                    </div>
                  )}

                  {post.taggedUser && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600/80 backdrop-blur rounded text-[9px] font-bold text-white tracking-tight">
                      {post.taggedUser}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
                    <div className="flex items-center gap-1">
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'fill-white'}`} />
                      <span>{post.likes + (isLiked ? 1 : 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>{post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar: Quick Booking CTA */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">
                Beğendiğiniz saç veya sakal modelini seçip hemen randevu oluşturabilirsiniz.
              </span>
            </div>

            <a
              href="#online-randevu"
              onClick={(e) => {
                e.preventDefault();
                if (onSelectModelForBooking) onSelectModelForBooking('Saç Kesimi');
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md text-center shrink-0"
            >
              📅 Bu Modellerle Randevu Al →
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox / Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Post Image */}
            <div className="md:w-1/2 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover max-h-[50vh] md:max-h-[85vh]"
              />
            </div>

            {/* Post Details & Booking Action */}
            <div className="md:w-1/2 p-5 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh] space-y-4">
              <div className="space-y-4">
                {/* Header with Avatar */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-rose-500 shrink-0">
                    <img
                      src={INSTAGRAM_PROFILE.avatarUrl}
                      alt={INSTAGRAM_PROFILE.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">
                      {INSTAGRAM_PROFILE.username}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Göktürk Caddesi No:47 C, İstanbul
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-2 text-xs">
                  <p className="text-slate-200 leading-relaxed">
                    <strong className="text-white mr-1.5">{INSTAGRAM_PROFILE.username}</strong>
                    {selectedPost.caption}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedPost.tags.map((tag, i) => (
                      <span key={i} className="text-[11px] text-blue-400 hover:underline">
                        {tag}{' '}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    {selectedPost.timeAgo}
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Book Model Button */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLike(selectedPost.id)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          likedPosts.includes(selectedPost.id)
                            ? 'fill-rose-500 text-rose-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                    <a
                      href={INSTAGRAM_PROFILE.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                    <a
                      href={INSTAGRAM_PROFILE.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400"
                    >
                      <Send className="w-5 h-5" />
                    </a>
                  </div>

                  <a
                    href={INSTAGRAM_PROFILE.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Instagram'da İncele</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-xs font-bold text-white font-mono">
                  {selectedPost.likes + (likedPosts.includes(selectedPost.id) ? 1 : 0)} beğeni
                </div>

                <button
                  onClick={() => handleBookModel(selectedPost)}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4 -rotate-45" />
                  <span>Bu Saç Modeli İçin Randevu Al</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
