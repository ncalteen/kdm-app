--------------------------------------------------------------------------------
-- Add FK from *_shared_user.shared_user_id to user_settings(user_id)
--
-- Enables PostgREST embedded selects so that get*SharedUsers DAL functions
-- can fetch the username in a single query instead of two sequential round
-- trips.
--------------------------------------------------------------------------------
alter table character_shared_user
add constraint fk_character_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table collective_cognition_reward_shared_user
add constraint fk_ccr_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table disorder_shared_user
add constraint fk_disorder_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table fighting_art_shared_user
add constraint fk_fighting_art_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table gear_shared_user
add constraint fk_gear_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table innovation_shared_user
add constraint fk_innovation_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table knowledge_shared_user
add constraint fk_knowledge_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table location_shared_user
add constraint fk_location_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table milestone_shared_user
add constraint fk_milestone_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table nemesis_shared_user
add constraint fk_nemesis_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table neurosis_shared_user
add constraint fk_neurosis_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table pattern_shared_user
add constraint fk_pattern_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table philosophy_shared_user
add constraint fk_philosophy_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table principle_shared_user
add constraint fk_principle_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table quarry_shared_user
add constraint fk_quarry_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table resource_shared_user
add constraint fk_resource_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table secret_fighting_art_shared_user
add constraint fk_secret_fighting_art_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table seed_pattern_shared_user
add constraint fk_seed_pattern_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table settlement_shared_user
add constraint fk_settlement_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table strain_milestone_shared_user
add constraint fk_strain_milestone_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table wanderer_shared_user
add constraint fk_wanderer_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;
alter table weapon_type_shared_user
add constraint fk_weapon_type_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade;