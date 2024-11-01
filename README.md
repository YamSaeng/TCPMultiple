# TCPMultiple
 
> 파일 설명

## Client.ts 
  - 더미용 클라이언트를 관리
  - DummyClientCreate(count) count 만큼의 더미 클라이언트를 생성하고 서버로 접속

## Config.ts, constant/Env.ts, constant/HandlerIds.ts, constant/PacketType.ts
  - 프로젝트에서 사용하는 상수 값 관리

## events
 - OnData
   - 유저가 보낸 패킷을 확인하고, PacketType에 맞게 패킷을 처리
 - OnEnd
   - 유저가 접속이 종료되면 해당 유저를 서버에서 삭제하고, DB에 정보 저장
 - OnError
   - 소켓 에러 출럭

## Managers
 - DatabaseManager.ts
   - DB 관리 ( 유저 생성, 유저 삭제, 유저 로그인 업데이트 )
 - IntervalManager.ts
   - setInterval을 관리

## protobuf
 - common.proto ( 일반 패킷 구조, ping 메세지 구조 )
 - requestGame.proto ( 위치 업데이트 패킷 구조 )
 - response.proto ( 응답 패킷 구조 )
 - responseGame.proto ( 모든 유저 위치 패킷 구조 )
 - gameInitial.proto ( 게임 초기화 패킷 구조 )

## handlers
 - Handlers
   - 패킷 처리 handler를 할당
 - GameInitialHandler.ts ( 게임 초기화 패킷 처리 )
   - 새로 접속한 유저가 이미 생성되어 있는 유저일 경우 DB에 저장되어 있는 마지막 위치 값을 가져와 전달
 - LocationUpdateHandler.ts ( 위치 업데이트 )
   - 패킷 전송한 유저의 위치 값을 업데이트하고, 나를 제외한 유저들의 위치값을 전부 가져와 전달
   - 유저의 pongCount가 일정 수 이상이라면, 접속 끊긴 유저라고 생각하고 패킷을 전송하지 않음

## packet
  - CreateResponse.ts ( GameInit 응답 패킷 조합 )
  - MakePacket.ts ( 위치 업데이트 응답 패킷, 핑 응답 패킷 생성 )
  - PacketParser.ts ( 패킷 해석 )

Server.ts ( 게임 서버 )
User.ts ( 유저 )

Main.ts ( 프로그램 진입점 )
