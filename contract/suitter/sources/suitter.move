module suitter::suitter;

use sui::table::{Self, Table};
use sui::package;
use std::string::String;
use std::string;

const EPROFILE_ALREADY_EXISTS: u64 = 100;
const EPROFILE_NOT_FOUND: u64 = 101;
const EPOST_NOT_FOUND: u64 = 102;
const ECOMMENT_TOO_LONG: u64 = 103;
const MAX_COMMENT_LENGTH: u64 = 280;
const EUSER_BLOCKED: u64 = 290;
const ECOMMENT_NOT_OWNER: u64 = 299;
const ECOMMENT_NOT_FOUND: u64 = 123;

public struct SUITTER has drop {}

public struct SuitterAppManager has key, store {
  id: UID,
  profiles: Table<address, Profile>,
  posts: Table<ID, Post>, 
 
}

public struct Profile has key, store { 
  id: UID,
  owner: address,
  username: String,
  bio: String,
  image_url: Option<String>
}

public struct Post has key, store {
  id: UID,
  author: address,
  content: String,
  like_count: u64,
  image_url: Option<String>,
  comments: Table<u64, Comment>,
  next_comment_id: u64, 
  blocked_commenters: vector<address>,
}

public struct Comment has store, drop {
  id: u64, 
  author: address,
  content: String,
}



fun init(otw: SUITTER, ctx: &mut TxContext) {
  let publisher = package::claim(otw, ctx);

  let manager = SuitterAppManager {
    id: object::new(ctx),
    profiles: table::new(ctx),
    posts: table::new(ctx),
  };

  transfer::share_object(manager);

  
  transfer::public_transfer(publisher, tx_context::sender(ctx));
}

public fun create_profile(manager: &mut SuitterAppManager,username: String,bio: String,image_url: Option<String>,ctx: &mut TxContext) {
  let sender = tx_context::sender(ctx);

  assert!(!manager.profiles.contains(sender), EPROFILE_ALREADY_EXISTS); 

  let profile = Profile {
    id: object::new(ctx),
    owner: sender,
    username: username,
    bio: bio,
    image_url: image_url
  };

  manager.profiles.add(sender, profile);
  
  
}

public fun create_post(manager: &mut SuitterAppManager,content: String,image_url: Option<String>,ctx: &mut TxContext) {
  let sender = tx_context::sender(ctx);

  assert!(manager.profiles.contains(sender), EPROFILE_NOT_FOUND); 

  let post = Post {
    id: object::new(ctx),
    author: sender,
    content: content,
    image_url: image_url,
    like_count: 0, 
    comments: table::new(ctx), 
    next_comment_id: 1,
    blocked_commenters: vector::empty<address>(),
  };

  let post_id = object::id(&post);

  manager.posts.add(post_id, post);

}


public fun like_post(manager: &mut SuitterAppManager,post_id: ID, ctx:&mut TxContext) {
  assert!(manager.posts.contains(post_id), EPOST_NOT_FOUND);
  assert!(manager.profiles.contains(tx_context::sender(ctx)), EPROFILE_NOT_FOUND);


  let post = manager.posts.borrow_mut(post_id);
  
  post.like_count = post.like_count + 1;
}

public fun add_comment(manager: &mut SuitterAppManager,post_id: ID,comment_content: String,ctx: &mut TxContext) {
  let sender = tx_context::sender(ctx);

  assert!(manager.posts.contains(post_id), EPOST_NOT_FOUND);
  assert!(manager.profiles.contains(sender), EPROFILE_NOT_FOUND); 
  assert!(string::length(&comment_content) <= MAX_COMMENT_LENGTH,ECOMMENT_TOO_LONG);

  let post = manager.posts.borrow_mut(post_id);
  let comment_id = post.next_comment_id;

  let comment = Comment {
    id: comment_id,
    author: sender,
    content: comment_content, 
  };

  assert!(!vector::contains(&post.blocked_commenters, &sender), EUSER_BLOCKED);

  
  post.comments.add(comment_id, comment);
  post.next_comment_id = post.next_comment_id + 1;
}

public fun delete_comment(manager: &mut SuitterAppManager, post_id: ID, comment_id: u64, ctx: &mut TxContext) {
  let sender = tx_context::sender(ctx);

  assert!(manager.posts.contains(post_id), EPOST_NOT_FOUND);
  let post = manager.posts.borrow_mut(post_id);

 
  assert!(post.comments.contains(comment_id), ECOMMENT_NOT_FOUND);

  let comment = post.comments.borrow(comment_id);
  assert!(comment.author == sender, ECOMMENT_NOT_OWNER);

  post.comments.remove(comment_id);
}

public fun edit_comment(manager: &mut SuitterAppManager, post_id: ID, comment_id: u64, new_content: String, ctx: &mut TxContext) {
  let sender = tx_context::sender(ctx);

  assert!(manager.posts.contains(post_id), EPOST_NOT_FOUND);
  let post = manager.posts.borrow_mut(post_id);

  assert!(post.comments.contains(comment_id), ECOMMENT_NOT_FOUND);
  

  assert!(string::length(&new_content) <= MAX_COMMENT_LENGTH, ECOMMENT_TOO_LONG);


  let comment = post.comments.borrow_mut(comment_id);
  assert!(comment.author == sender, ECOMMENT_NOT_OWNER);

  comment.content = new_content; 
}

public fun block_commenter(manager: &mut SuitterAppManager, post_id: ID, user_to_block: address, ctx: &mut TxContext) {
  let sender = tx_context::sender(ctx);

  assert!(manager.posts.contains(post_id), EPOST_NOT_FOUND);
  let post = manager.posts.borrow_mut(post_id);


  assert!(post.author == sender, ECOMMENT_NOT_OWNER); // Reusing ECOMMENT_NOT_OWNER for unauthorized action


  if (!vector::contains(&post.blocked_commenters, &user_to_block)) {
    post.blocked_commenters.push_back(user_to_block);
  }
}

