import { defineTable, fieldBuilder } from 'spreadsheet-orm';

// 가장 기본적인 사용자 스키마
export const userSchema = defineTable('users', {
  id: fieldBuilder.string().build(),
  name: fieldBuilder.string().build(),
  age: fieldBuilder.number().build(),
});

// 다른 스키마를 참조하고, 다양한 타입을 가진 포스트 스키마
export const postSchema = defineTable('posts', {
  postId: fieldBuilder.string().build(),
  title: fieldBuilder.string().build(),
  authorId: fieldBuilder.reference(userSchema, 'id').build(),
  isPublished: fieldBuilder.boolean().default(false).build(),
  createdAt: fieldBuilder.date().build(),
});

// 모든 스키마를 포함하는 배열
export const testSchemas = [userSchema, postSchema];
