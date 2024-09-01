class PeerService {
    constructor() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        });
    }

    async getOffer() {
        if (this.peer) {
            try {
                const offer = await this.peer.createOffer();
                await this.peer.setLocalDescription(offer);
                return offer;
            } catch (error) {
                console.error("Error creating offer:", error);
                throw error;
            }
        } else {
            throw new Error("Peer connection not initialized");
        }
    }

    async getAnswer(offer) {
        if (this.peer) {
            try {
                await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await this.peer.createAnswer();
                await this.peer.setLocalDescription(answer);
                return answer;
            } catch (error) {
                console.error("Error creating answer:", error);
                throw error;
            }
        } else {
            throw new Error("Peer connection not initialized");
        }
    }

    async setRemoteDescription(ans) {
        if (this.peer) {
            try {
                await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            } catch (error) {
                console.error("Error setting remote description:", error);
                throw error;
            }
        } else {
            throw new Error("Peer connection not initialized");
        }
    }
}

export default new PeerService();
