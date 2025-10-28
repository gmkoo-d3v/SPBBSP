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
    boardTitle varchar(50),
    boardWriter varchar(20),
    boardPass varchar(20),
    boardContents varchar(500),
    boardHits int default 0,
    createdAt datetime default now(),
    fileAttached int default 0
);

-- board_file_table
drop table if exists board_file_table;
create table board_file_table
(
    id bigint auto_increment primary key,
    originalFileName varchar(100),
    storedFileName varchar(100),
    boardId bigint,
    constraint fk_board_file foreign key(boardId) references board_table(id) on delete cascade
);

-- comment_table
drop table if exists comment_table;
create table comment_table
(
    id bigint auto_increment primary key,
    commentWriter varchar(20) not null,
    commentContents varchar(500) not null,
    boardId bigint not null,
    createdAt datetime default now(),
    constraint fk_comment_board foreign key(boardId) references board_table(id) on delete cascade
);