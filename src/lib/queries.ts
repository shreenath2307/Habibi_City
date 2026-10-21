'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRoutes,
  fetchStations,
  fetchRoutePosts,
  fetchLikes,
  likePost,
  fetchComments,
  addComment,
  reportItem,
} from './supabase'
import { Post, Route, Station, Comment, LikesState } from '@/types/database'

export const QUERY_KEYS = {
  routes: ['routes'] as const,
  stations: ['stations'] as const,
  routePosts: ['posts', 'route'] as const,
  likes: (postIds: string[]) => ['likes', postIds.sort().join(',')] as const,
  comments: (postIds: string[]) => ['comments', postIds.sort().join(',')] as const,
}

export function useRoutesQuery() {
  return useQuery<Route[]>({
    queryKey: QUERY_KEYS.routes,
    queryFn: fetchRoutes,
  })
}

export function useStationsQuery() {
  return useQuery<Station[]>({
    queryKey: QUERY_KEYS.stations,
    queryFn: fetchStations,
  })
}

export function useRoutePostsQuery() {
  return useQuery<Post[]>({
    queryKey: QUERY_KEYS.routePosts,
    queryFn: fetchRoutePosts,
  })
}

export function useLikesQuery(postIds: string[]) {
  return useQuery<LikesState>({
    queryKey: QUERY_KEYS.likes(postIds),
    queryFn: () => fetchLikes(postIds),
    enabled: postIds.length > 0,
  })
}

export function useCommentsQuery(postIds: string[]) {
  return useQuery<Record<string, Comment[]>>({
    queryKey: QUERY_KEYS.comments(postIds),
    queryFn: () => fetchComments(postIds),
    enabled: postIds.length > 0,
  })
}

export function useLikePostMutation(postIds: string[]) {
  const queryClient = useQueryClient()
  const key = QUERY_KEYS.likes(postIds)

  return useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previousLikes = queryClient.getQueryData<LikesState>(key)

      if (previousLikes) {
        const nextMine = new Set(previousLikes.mine)
        const alreadyLiked = nextMine.has(postId)
        if (!alreadyLiked) {
          nextMine.add(postId)
          queryClient.setQueryData<LikesState>(key, {
            counts: {
              ...previousLikes.counts,
              [postId]: (previousLikes.counts[postId] || 0) + 1,
            },
            mine: nextMine,
          })
        }
      }

      return { previousLikes }
    },
    onError: (_err, _postId, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(key, context.previousLikes)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
    },
  })
}

export function useAddCommentMutation(postIds: string[]) {
  const queryClient = useQueryClient()
  const key = QUERY_KEYS.comments(postIds)

  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: string }) => addComment(postId, body),
    onSuccess: (newComment) => {
      queryClient.setQueryData<Record<string, Comment[]>>(key, (old = {}) => ({
        ...old,
        [newComment.post_id]: [...(old[newComment.post_id] || []), newComment],
      }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
    },
  })
}

export function useReportItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { postId?: string | null; commentId?: string | null }) =>
      reportItem(params),
    onSuccess: () => {
      // 3 reports hide an item, so refetch posts to keep feed clean
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.routePosts })
    },
  })
}
