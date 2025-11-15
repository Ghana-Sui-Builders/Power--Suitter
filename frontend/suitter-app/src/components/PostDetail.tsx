import { useState, useEffect } from 'react';
import { Box, Button, Card, Flex, Heading, Text, TextArea, Spinner, Avatar } from '@radix-ui/themes';
import { ArrowLeftIcon, HeartIcon, TrashIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Post } from '../hooks/usePost';
import { useUsername } from '../hooks/useUsername';

const PACKAGE_ID = import.meta.env.VITE_SUITTER_PACKAGE_ID;
const MANAGER_ID = import.meta.env.VITE_SUITTER_MANAGER_ID;

interface Comment {
  id: number;
  author: string;
  content: string;
}

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onUpdate: () => void;
}

// Comment component with username hook
function CommentItem({ 
  comment, 
  editingCommentId, 
  editContent, 
  currentAccount, 
  onEdit, 
  onCancelEdit, 
  onSaveEdit, 
  onDelete,
  onEditContentChange 
}: { 
  comment: Comment;
  editingCommentId: number | null;
  editContent: string;
  currentAccount: any;
  onEdit: (id: number, content: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onEditContentChange: (content: string) => void;
}) {
  const { username } = useUsername(comment.author);

  return (
    <Card style={{ padding: '1rem' }}>
      {editingCommentId === comment.id ? (
        // Edit mode
        <Flex direction="column" gap="2">
          <TextArea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            size="2"
          />
          <Flex gap="2" justify="end">
            <Button
              size="1"
              variant="soft"
              onClick={onCancelEdit}
            >
              Cancel
            </Button>
            <Button
              size="1"
              onClick={() => onSaveEdit(comment.id)}
            >
              Save
            </Button>
          </Flex>
        </Flex>
      ) : (
        // View mode
        <Flex direction="column" gap="2">
          <Flex gap="2" align="center">
            <Avatar 
              size="2" 
              fallback={username ? username[0].toUpperCase() : comment.author.slice(0, 2)} 
              radius="full" 
            />
            <Text size="2" weight="bold">
              {username || `${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`}
            </Text>
          </Flex>
          <Text size="3">{comment.content}</Text>
          
          {/* Show edit/delete only for comment owner */}
          {currentAccount?.address === comment.author && (
            <Flex gap="2">
              <Button
                size="1"
                variant="ghost"
                style={{ cursor: 'pointer' }}
                onClick={() => onEdit(comment.id, comment.content)}
              >
                <Pencil1Icon />
              </Button>
              <Button
                size="1"
                variant="ghost"
                color="red"
                style={{ cursor: 'pointer' }}
                onClick={() => onDelete(comment.id)}
              >
                <TrashIcon />
              </Button>
            </Flex>
          )}
        </Flex>
      )}
    </Card>
  );
}

export function PostDetail({ post, onBack, onUpdate }: PostDetailProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { username: postUsername } = useUsername(post.author);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');

  // Fetch comments
  const fetchComments = async () => {
    setIsLoadingComments(true);

    try {
      // 1. Load manager
      const managerObject = await suiClient.getObject({
        id: MANAGER_ID,
        options: { showContent: true },
      });

      if (!managerObject.data?.content) {
        console.warn("Manager has no content");
        setComments([]);
        setIsLoadingComments(false);
        return;
      }

      const managerContent: any = managerObject.data.content;
      const postsTableId = managerContent.fields.posts.fields.id.id;

      // 2. Load post dynamic field
      const postDynamicField = await suiClient.getDynamicFieldObject({
        parentId: postsTableId,
        name: {
          type: '0x2::object::ID',
          value: post.id,
        },
      });

      if (!postDynamicField.data?.content) {
        console.warn("Post dynamic field has no content");
        setComments([]);
        setIsLoadingComments(false);
        return;
      }

      const postValue = (postDynamicField.data.content as any).fields.value.fields;
      const commentsTableId = postValue.comments.fields.id.id;

      // 3. Fetch comment dynamic fields
      const fieldsResponse = await suiClient.getDynamicFields({
        parentId: commentsTableId,
      });

      // 4. Fetch each comment
      const commentsData = await Promise.all(
        fieldsResponse.data.map(async (field) => {
          try {
            const commentObject = await suiClient.getDynamicFieldObject({
              parentId: commentsTableId,
              name: {
                type: 'u64',
                value: String(field.name.value),
              },
            });

            if (!commentObject.data?.content) return null;

            const raw = (commentObject.data.content as any).fields.value.fields;

            return {
              id: Number(raw.id),
              author: raw.author ?? "0x0",
              content: raw.content ?? "",
            };
          } catch (err) {
            console.error("Error fetching comment:", err);
            return null;
          }
        })
      );

      const valid = commentsData.filter((c): c is Comment => c !== null);
      setComments(valid);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (newComment.length > 280) {
      setError('Comment too long (max 280 characters)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::suitter::add_comment`,
        arguments: [
          tx.object(MANAGER_ID),
          tx.pure.address(post.id),
          tx.pure.string(newComment.trim()),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async () => {
            console.log('Comment added successfully');
            setNewComment('');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchComments();
            onUpdate();
            setIsSubmitting(false);
          },
          onError: (err) => {
            console.error('Error adding comment:', err);
            setError('Failed to add comment. Please try again.');
            setIsSubmitting(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError('Failed to add comment. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::suitter::delete_comment`,
        arguments: [
          tx.object(MANAGER_ID),
          tx.pure.address(post.id),
          tx.pure.u64(commentId),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async () => {
            console.log('Comment deleted successfully');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchComments();
            onUpdate();
          },
          onError: (err) => {
            console.error('Error deleting comment:', err);
            alert('Failed to delete comment');
          },
        }
      );
    } catch (err) {
      console.error('Transaction error:', err);
      alert('Failed to delete comment');
    }
  };

  // Edit comment
  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (editContent.length > 280) {
      setError('Comment too long (max 280 characters)');
      return;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::suitter::edit_comment`,
        arguments: [
          tx.object(MANAGER_ID),
          tx.pure.address(post.id),
          tx.pure.u64(commentId),
          tx.pure.string(editContent.trim()),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async () => {
            console.log('Comment edited successfully');
            setEditingCommentId(null);
            setEditContent('');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchComments();
            onUpdate();
          },
          onError: (err) => {
            console.error('Error editing comment:', err);
            setError('Failed to edit comment');
          },
        }
      );
    } catch (err) {
      console.error('Transaction error:', err);
      setError('Failed to edit comment');
    }
  };

  // Like post
  const handleLike = async () => {
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::suitter::like_post`,
        arguments: [
          tx.object(MANAGER_ID),
          tx.pure.address(post.id),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async () => {
            console.log('Post liked successfully');
            await new Promise(resolve => setTimeout(resolve, 1500));
            onUpdate();
          },
          onError: (err) => {
            console.error('Error liking post:', err);
          },
        }
      );
    } catch (err) {
      console.error('Transaction error:', err);
    }
  };

  return (
    <Box style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button */}
      <Button
        variant="ghost"
        size="2"
        style={{ marginBottom: '1rem', cursor: 'pointer' }}
        onClick={onBack}
      >
        <Flex gap="2" align="center">
          <ArrowLeftIcon />
          <Text>Back to Feed</Text>
        </Flex>
      </Button>

      {/* Post Card */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <Flex direction="column" gap="3">
          {/* Author */}
      <Flex gap="3" align="center">
        <Avatar 
          size="3" 
          fallback={postUsername ? postUsername[0].toUpperCase() : post.author.slice(0, 2)} 
          radius="full" 
        />
        <Box>
          <Text size="3" weight="bold">
            {`${post.author.slice(0, 6)}...${post.author.slice(-4)}`}
          </Text>
          <Text size="2" color="gray">
            @{postUsername || post.author.slice(0, 8)}
          </Text>
        </Box>
      </Flex>

          {/* Content */}
          <Text size="4" style={{ whiteSpace: 'pre-wrap' }}>
            {post.content}
          </Text>

          {/* Image */}
          {post.image_url && (
            <Box>
              <img
                src={post.image_url}
                alt="Post"
                style={{
                  width: '100%',
                  maxHeight: '500px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Box>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="2"
            style={{ width: 'fit-content', cursor: 'pointer' }}
            onClick={handleLike}
          >
            <Flex gap="2" align="center">
              <HeartIcon />
              <Text>{post.like_count} Likes</Text>
            </Flex>
          </Button>
        </Flex>
      </Card>

      {/* Comments Section */}
      <Heading size="5" style={{ marginBottom: '1rem' }}>
        Comments ({post.comments_count})
      </Heading>

      {/* Add Comment Form */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <Flex direction="column" gap="3">
          <TextArea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            size="3"
            style={{ minHeight: '80px' }}
          />
          
          <Text size="2" color="gray">
            {newComment.length}/280 characters
          </Text>

          {error && (
            <Text size="2" color="red">
              {error}
            </Text>
          )}

          <Flex justify="end">
            <Button
              size="2"
              style={{ cursor: 'pointer' }}
              onClick={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Comments List */}
      {isLoadingComments ? (
        <Flex justify="center" style={{ padding: '2rem' }}>
          <Spinner size="3" />
        </Flex>
      ) : comments.length === 0 ? (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text size="3" color="gray">
            No comments yet. Be the first to comment!
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              editingCommentId={editingCommentId}
              editContent={editContent}
              currentAccount={currentAccount}
              onEdit={(id, content) => {
                setEditingCommentId(id);
                setEditContent(content);
              }}
              onCancelEdit={() => {
                setEditingCommentId(null);
                setEditContent('');
              }}
              onSaveEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onEditContentChange={setEditContent}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}