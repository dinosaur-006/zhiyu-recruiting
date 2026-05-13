export type AvatarProviderType = 'mockVideo' | 'liveAvatar' | 'synthesia';

export interface AvatarRenderResult {
  videoUrl?: string;
  streamUrl?: string;
  fallbackText: string;
}

export interface AvatarProvider {
  type: AvatarProviderType;
  renderScene: (params: {
    roleName: string;
    roleTitle: string;
    script: string;
    videoUrl?: string;
  }) => Promise<AvatarRenderResult>;
}

export const mockVideoProvider: AvatarProvider = {
  type: 'mockVideo',
  async renderScene({ script, videoUrl }) {
    return {
      videoUrl,
      fallbackText: script,
    };
  },
};
