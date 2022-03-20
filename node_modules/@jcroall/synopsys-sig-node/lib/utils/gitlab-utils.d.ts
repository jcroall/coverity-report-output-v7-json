import { ProjectSchema } from '@gitbeaker/core/dist/types/resources/Projects';
import { DiscussionSchema } from '@gitbeaker/core/dist/types/templates/ResourceDiscussions';
export declare function gitlabGetProject(gitlab_url: string, gitlab_token: string, project_id: string): Promise<ProjectSchema>;
export declare function gitlabGetDiscussions(gitlab_url: string, gitlab_token: string, project_id: string, merge_request_iid: number): Promise<DiscussionSchema[]>;
export declare function gitlabGetDiffMap(gitlab_url: string, gitlab_token: string, project_id: string, merge_request_iid: number): Promise<Map<any, any>>;
export declare function gitlabUpdateNote(gitlab_url: string, gitlab_token: string, project_id: string, merge_request_iid: number, discussion_id: number, note_id: number, body: string): Promise<boolean>;
export declare function gitlabCreateDiscussion(gitlab_url: string, gitlab_token: string, project_id: string, merge_request_iid: number, line: number, filename: string, body: string, base_sha: string): Promise<boolean>;
