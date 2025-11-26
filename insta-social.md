Auth
 - register
 - login
 - logout


Posts
 - { image , caption , mentions , createdAt , userId}

comments
 - { post , userid , text ,createdAt }

likes
 - { post , userid , createdAt }

User
 - {username , email , password , image , bio}

follow
 - {followerId , followingId , createdAt , status}

- chat
    - { senderId , receiverId , message , createdAt }