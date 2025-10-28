-- user_table
drop table if exists user_table;
create table user_table
(
    id bigint primary key auto_increment,
    username varchar(50) unique not null,
    password varchar(255) not null,
    email varchar(100),
    role varchar(20) default 'ROLE_USER',
    enabled boolean default true,
    createdAt datetime default now()
);

-- board_table
drop table if exists board_table;
create table board_table
(
    id bigint primary key auto_increment,
    boardTitle varchar(200),
    boardWriter varchar(50),
    boardPass varchar(100),
    boardContents TEXT,
    boardHits int default 0,
    createdAt datetime default now(),
    fileAttached int default 0
);

-- board_file_table
drop table if exists board_file_table;
create table board_file_table
(
    id bigint auto_increment primary key,
    originalFileName varchar(200),
    storedFileName varchar(200),
    boardId bigint,
    constraint fk_board_file foreign key(boardId) references board_table(id) on delete cascade
);

-- comment_table
drop table if exists comment_table;
create table comment_table
(
    id bigint auto_increment primary key,
    commentWriter varchar(50) not null,
    commentContents TEXT not null,
    boardId bigint not null,
    createdAt datetime default now(),
    constraint fk_comment_board foreign key(boardId) references board_table(id) on delete cascade
);

-- reply_table (대댓글)
drop table if exists reply_table;
create table reply_table
(
    id bigint auto_increment primary key,
    replyWriter varchar(50) not null,
    replyContents TEXT not null,
    commentId bigint not null,
    createdAt datetime default now(),
    constraint fk_reply_comment foreign key(commentId) references comment_table(id) on delete cascade
);