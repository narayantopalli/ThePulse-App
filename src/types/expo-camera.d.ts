declare module 'expo-camera' {
    import { Component } from 'react';
    import { ViewProps } from 'react-native';

    export interface CameraProps extends ViewProps {
        type?: 'front' | 'back';
        flashMode?: 'off' | 'on' | 'auto' | 'torch';
        ratio?: string;
        ref?: any;
    }

    export class Camera extends Component<CameraProps> {
        static Constants: {
            Type: {
                front: 'front';
                back: 'back';
            };
        };
        takePictureAsync(): Promise<{ uri: string }>;
    }

    export function requestCameraPermissionsAsync(): Promise<{ status: string }>;
} 