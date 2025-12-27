import Peer from 'peerjs'

class VoiceManager {
    private peer: Peer | null = null
    private currentCall: any = null
    private localStream: MediaStream | null = null
    private remoteStream: MediaStream | null = null
    private isMuted: boolean = false

    async initialize(userId: string) {
        if (this.peer) {
            return this.peer
        }

        this.peer = new Peer(userId, {
            host: '/',
            port: 3001,
            path: '/peerjs'
        })

        return new Promise<Peer>((resolve, reject) => {
            this.peer!.on('open', () => {
                console.log('Peer connection opened')
                resolve(this.peer!)
            })

            this.peer!.on('error', (error) => {
                console.error('Peer error:', error)
                reject(error)
            })

            this.peer!.on('call', async (call) => {
                try {
                    const stream = await this.getLocalStream()
                    call.answer(stream)

                    call.on('stream', (remoteStream) => {
                        this.remoteStream = remoteStream
                        this.playRemoteStream(remoteStream)
                    })

                    this.currentCall = call
                } catch (error) {
                    console.error('Error answering call:', error)
                }
            })
        })
    }

    async getLocalStream(): Promise<MediaStream> {
        if (this.localStream) {
            return this.localStream
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            })
            return this.localStream
        } catch (error) {
            console.error('Error getting local stream:', error)
            throw error
        }
    }

    async call(remotePeerId: string) {
        if (!this.peer) {
            throw new Error('Peer not initialized')
        }

        try {
            const stream = await this.getLocalStream()
            const call = this.peer.call(remotePeerId, stream)

            call.on('stream', (remoteStream) => {
                this.remoteStream = remoteStream
                this.playRemoteStream(remoteStream)
            })

            this.currentCall = call
            return call
        } catch (error) {
            console.error('Error making call:', error)
            throw error
        }
    }

    playRemoteStream(stream: MediaStream) {
        const audioElement = document.getElementById('remote-audio') as HTMLAudioElement
        if (audioElement) {
            audioElement.srcObject = stream
            audioElement.play()
        }
    }

    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                this.isMuted = !audioTrack.enabled
            }
        }
        return this.isMuted
    }

    getMuteStatus() {
        return this.isMuted
    }

    endCall() {
        if (this.currentCall) {
            this.currentCall.close()
            this.currentCall = null
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop())
            this.localStream = null
        }

        this.remoteStream = null
        this.isMuted = false
    }

    destroy() {
        this.endCall()
        if (this.peer) {
            this.peer.destroy()
            this.peer = null
        }
    }
}

export const voiceManager = new VoiceManager()
