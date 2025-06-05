import { useState, useCallback } from 'react';

interface UseTagHandlersProps {
  clientId?: string;
  currentUserId?: string;
  clientTags: any[];
  setClientTags: (tags: any[]) => void;
  availableTags: any[];
  setAvailableTags: (tags: any[]) => void;
  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;
  tagForm: any;
  setTagForm: (form: any) => void;
  setShowTagModal: (show: boolean) => void;
  setShowCreateTagModal: (show: boolean) => void;
  setShowTagSuccessModal: (show: boolean) => void;
  setTagSuccessMessage: (message: string) => void;
  showError: (title: string, message: string) => void;
}

export function useTagHandlers({
  clientId,
  currentUserId,
  clientTags,
  setClientTags,
  availableTags,
  setAvailableTags,
  selectedTagIds,
  setSelectedTagIds,
  tagForm,
  setTagForm,
  setShowTagModal,
  setShowCreateTagModal,
  setShowTagSuccessModal,
  setTagSuccessMessage,
  showError,
}: UseTagHandlersProps) {
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const loadClientTags = useCallback(async () => {
    if (!clientId || !currentUserId) return;

    setIsLoadingTags(true);
    try {
      const [clientTagsRes, availableTagsRes] = await Promise.all([
        fetch(`/api/clients/${clientId}/tags`),
        fetch(`/api/agents/${currentUserId}/tags`),
      ]);

      if (clientTagsRes.ok && availableTagsRes.ok) {
        const clientTagsData = await clientTagsRes.json();
        const availableTagsData = await availableTagsRes.json();

        setClientTags(clientTagsData);
        setAvailableTags(availableTagsData);
        setSelectedTagIds(clientTagsData.map((tag: any) => tag.id));
      }
    } catch (error) {
      console.error('태그 로딩 실패:', error);
    } finally {
      setIsLoadingTags(false);
    }
  }, [
    clientId,
    currentUserId,
    setClientTags,
    setAvailableTags,
    setSelectedTagIds,
  ]);

  const handleOpenTagModal = useCallback(() => {
    loadClientTags();
    setShowTagModal(true);
  }, [loadClientTags, setShowTagModal]);

  const handleSaveTags = useCallback(async () => {
    if (!clientId) return;

    setIsLoadingTags(true);
    try {
      const response = await fetch('/api/clients/client-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          tagIds: selectedTagIds,
          action: 'update',
        }),
      });

      if (response.ok) {
        await loadClientTags();
        setShowTagModal(false);
        setTagSuccessMessage('태그가 성공적으로 업데이트되었습니다.');
        setShowTagSuccessModal(true);
      } else {
        const error = await response.json();
        showError(
          '태그 저장 실패',
          error.message || '태그 저장 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('태그 저장 실패:', error);
      showError('태그 저장 실패', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoadingTags(false);
    }
  }, [
    clientId,
    selectedTagIds,
    loadClientTags,
    setShowTagModal,
    setTagSuccessMessage,
    setShowTagSuccessModal,
    showError,
  ]);

  const handleCreateTag = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoadingTags(true);
    try {
      const response = await fetch('/api/agents/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentUserId,
          ...tagForm,
        }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags([...availableTags, newTag]);
        setTagForm({
          id: '',
          name: '',
          color: '#3b82f6',
          description: '',
        });
        setShowCreateTagModal(false);

        setSelectedTagIds([...selectedTagIds, newTag.id as string]);
      } else {
        const error = await response.json();
        showError(
          '태그 생성 실패',
          error.message || '태그 생성 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('태그 생성 실패:', error);
      showError('태그 생성 실패', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoadingTags(false);
    }
  }, [
    currentUserId,
    tagForm,
    availableTags,
    setAvailableTags,
    setTagForm,
    setShowCreateTagModal,
    setSelectedTagIds,
    showError,
  ]);

  const removeClientTag = useCallback(
    async (tagId: string) => {
      if (!clientId) return;

      try {
        const response = await fetch('/api/clients/client-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            tagId: tagId,
            action: 'remove',
          }),
        });

        if (response.ok) {
          await loadClientTags();
          setTagSuccessMessage('태그가 성공적으로 제거되었습니다.');
          setShowTagSuccessModal(true);
        } else {
          const error = await response.json();
          showError(
            '태그 제거 실패',
            error.message || '태그 제거 중 오류가 발생했습니다.'
          );
        }
      } catch (error) {
        console.error('태그 제거 실패:', error);
        showError('태그 제거 실패', '네트워크 오류가 발생했습니다.');
      }
    },
    [
      clientId,
      loadClientTags,
      setTagSuccessMessage,
      setShowTagSuccessModal,
      showError,
    ]
  );

  return {
    isLoadingTags,
    loadClientTags,
    handleOpenTagModal,
    handleSaveTags,
    handleCreateTag,
    removeClientTag,
  };
}
