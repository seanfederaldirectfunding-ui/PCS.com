"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Video, VideoOff, Mic, MicOff } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  videoEnabled: boolean
  audioEnabled: boolean
  volume: number
  stream?: MediaStream
}

export function SameRoom() {
  const [isOpen, setIsOpen] = useState(false)
  const [myVideoEnabled, setMyVideoEnabled] = useState(true)
  const [myAudioEnabled, setMyAudioEnabled] = useState(true)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [allTeamMembers] = useState<TeamMember[]>([
    { id: "1", name: "John D.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "2", name: "Sarah M.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "3", name: "Mike R.", videoEnabled: false, audioEnabled: true, volume: 50 },
    { id: "4", name: "Lisa K.", videoEnabled: true, audioEnabled: false, volume: 50 },
    { id: "5", name: "Tom B.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "6", name: "Amy L.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "7", name: "David P.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "8", name: "Emma W.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "9", name: "Chris H.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "10", name: "Nina S.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "11", name: "Alex T.", videoEnabled: true, audioEnabled: true, volume: 50 },
    { id: "12", name: "Maya C.", videoEnabled: true, audioEnabled: true, volume: 50 },
  ])
  const [currentPage, setCurrentPage] = useState(0)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const membersPerPage = 6
  const totalPages = Math.ceil(allTeamMembers.length / membersPerPage)

  const [myStream, setMyStream] = useState<MediaStream | null>(null)
  const myVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const startIndex = currentPage * membersPerPage
    const endIndex = startIndex + membersPerPage
    setTeamMembers(allTeamMembers.slice(startIndex, endIndex))
  }, [currentPage, allTeamMembers])

  useEffect(() => {
    if (isBroadcasting && myVideoEnabled) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: myAudioEnabled })
        .then((stream) => {
          setMyStream(stream)
          if (myVideoRef.current) {
            myVideoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error("[v0] Error accessing media devices:", err)
        })
    }

    return () => {
      if (!isBroadcasting && myStream) {
        myStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isBroadcasting, myVideoEnabled, myAudioEnabled])

  const toggleMyVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !myVideoEnabled
      }
    }
    setMyVideoEnabled(!myVideoEnabled)
  }

  const toggleMyAudio = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !myAudioEnabled
      }
    }
    setMyAudioEnabled(!myAudioEnabled)
  }

  const startBroadcasting = () => {
    setIsBroadcasting(true)
  }

  const stopBroadcasting = () => {
    setIsBroadcasting(false)
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop())
      setMyStream(null)
    }
  }

  const toggleMemberVideo = (id: string) => {
    setTeamMembers((members) =>
      members.map((member) => (member.id === id ? { ...member, videoEnabled: !member.videoEnabled } : member)),
    )
  }

  const toggleMemberAudio = (id: string) => {
    setTeamMembers((members) =>
      members.map((member) => (member.id === id ? { ...member, audioEnabled: !member.audioEnabled } : member)),
    )
  }

  const updateMemberVolume = (id: string, volume: number) => {
    setTeamMembers((members) => members.map((member) => (member.id === id ? { ...member, volume } : member)))
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const leftMembers = teamMembers.slice(0, 3)
  const rightMembers = teamMembers.slice(3, 6)

  return (
    <div className="relative z-[200]">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg relative"
        size="sm"
      >
        {isOpen ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
        SAMEROOM
        {isBroadcasting && !isOpen && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950 z-[99998]" />

          <div className="fixed inset-0 z-[99999] flex items-start justify-between px-4 pt-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>

              <div className="flex flex-col gap-3">
                {leftMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-slate-900/90 rounded-lg p-2 border border-white/20 w-24 h-24"
                    style={{ width: "96px", height: "96px" }}
                  >
                    <div className="relative w-full h-full bg-black rounded-md overflow-hidden">
                      {member.videoEnabled ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-600">
                          <span className="text-white font-bold text-sm">
                            {member.name.split(" ")[0][0]}
                            {member.name.split(" ")[1]?.[0]}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <VideoOff className="h-4 w-4 text-white/50" />
                        </div>
                      )}
                      {!member.audioEnabled && (
                        <div className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5">
                          <MicOff className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-3 border border-purple-500/30">
                <div className="relative w-32 h-32 bg-black rounded-lg overflow-hidden border-2 border-purple-500 mb-2">
                  {myVideoEnabled && isBroadcasting ? (
                    <video ref={myVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                      <span className="text-white font-bold text-3xl">ME</span>
                    </div>
                  )}
                  {isBroadcasting && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>
                <p className="text-white font-medium text-sm mb-2 text-center">You</p>
                <div className="flex gap-2 justify-center mb-2">
                  <Button
                    onClick={toggleMyVideo}
                    size="sm"
                    variant={myVideoEnabled ? "default" : "destructive"}
                    className="h-8"
                    disabled={!isBroadcasting}
                  >
                    {myVideoEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
                  </Button>
                  <Button
                    onClick={toggleMyAudio}
                    size="sm"
                    variant={myAudioEnabled ? "default" : "destructive"}
                    className="h-8"
                    disabled={!isBroadcasting}
                  >
                    {myAudioEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                  </Button>
                </div>
                {!isBroadcasting ? (
                  <Button
                    onClick={startBroadcasting}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Start Broadcasting
                  </Button>
                ) : (
                  <Button onClick={stopBroadcasting} size="sm" variant="destructive" className="w-full">
                    Stop Broadcasting
                  </Button>
                )}
              </div>

              <p className="text-white/70 text-xs text-center">
                {currentPage + 1}/{totalPages}
                <br />
                {allTeamMembers.length} members
              </p>

              <Button
                onClick={() => setIsOpen(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="sm"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>

              <div className="flex flex-col gap-3">
                {rightMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-slate-900/90 rounded-lg p-2 border border-white/20 w-24 h-24"
                    style={{ width: "96px", height: "96px" }}
                  >
                    <div className="relative w-full h-full bg-black rounded-md overflow-hidden">
                      {member.videoEnabled ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-600">
                          <span className="text-white font-bold text-sm">
                            {member.name.split(" ")[0][0]}
                            {member.name.split(" ")[1]?.[0]}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <VideoOff className="h-4 w-4 text-white/50" />
                        </div>
                      )}
                      {!member.audioEnabled && (
                        <div className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5">
                          <MicOff className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
