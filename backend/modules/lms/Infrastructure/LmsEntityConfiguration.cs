using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Lms.Domain;

namespace NacenTech.Modules.Lms.Infrastructure;

public sealed class LearningMaterialConfiguration : IEntityTypeConfiguration<LearningMaterial>
{
    public void Configure(EntityTypeBuilder<LearningMaterial> b)
    {
        b.ToTable("learning_materials", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.MaterialCode).HasMaxLength(30).IsRequired();
        b.Property(x => x.Title).HasMaxLength(250).IsRequired();
        b.Property(x => x.LessonType).HasMaxLength(20).IsRequired();
        b.Property(x => x.SectorCode).HasMaxLength(30);
        b.Property(x => x.DurationMinutes).IsRequired();
        b.Property(x => x.DescriptionHtml).IsRequired();

        b.Property(x => x.VideoStorageKey).HasMaxLength(500);
        b.Property(x => x.VideoFileName).HasMaxLength(255);
        b.Property(x => x.VideoFileSize);
        b.Property(x => x.VideoSha256).HasMaxLength(64);
        b.Property(x => x.ThumbnailUrl).HasMaxLength(500);

        b.Property(x => x.Status).HasMaxLength(20).HasDefaultValue(LmsStatuses.Draft).IsRequired();
        b.Property(x => x.UnpublishReason).HasMaxLength(250);
        b.Property(x => x.UnpublishedByName).HasMaxLength(150);

        b.Property(x => x.CreatedByName).HasMaxLength(150).IsRequired();
        b.Property(x => x.UpdatedByName).HasMaxLength(150);

        b.Property(x => x.IsDeleted).HasDefaultValue(false);
        b.Property(x => x.RagChunkCount).HasDefaultValue(0);

        b.Property(x => x.ViewCount).HasDefaultValue(0);
        b.Property(x => x.CompletionCount).HasDefaultValue(0);
        b.Property(x => x.RatingAverage).HasDefaultValue(0.0);
        b.Property(x => x.RatingCount).HasDefaultValue(0);
        b.Property(x => x.Slug).HasMaxLength(300);

        b.Property(x => x.ClusterCode).HasMaxLength(20);
        b.Property(x => x.ClusterName).HasMaxLength(250);
        b.Property(x => x.StepNumber);
        b.Property(x => x.TargetAudience);
        b.Property(x => x.PreparationNotes);
        b.Property(x => x.ExpectedOutcome);
        b.Property(x => x.PassScorePercent).HasDefaultValue(80);
        b.Property(x => x.LearningObjectivesJson).HasColumnType("jsonb");
        b.Property(x => x.LearningRoadmapJson).HasColumnType("jsonb");
        b.Property(x => x.KnowledgeSummaryJson).HasColumnType("jsonb");
        b.Property(x => x.PracticeWorkbookJson).HasColumnType("jsonb");

        b.Property(x => x.Version).IsConcurrencyToken();

        b.HasIndex(x => x.MaterialCode).IsUnique().HasDatabaseName("ix_learning_materials_code_unique");
        b.HasIndex(x => x.Status).HasDatabaseName("ix_learning_materials_status");
        b.HasIndex(x => x.LessonType).HasDatabaseName("ix_learning_materials_lesson_type");
        b.HasIndex(x => x.SectorCode).HasDatabaseName("ix_learning_materials_sector_code");
        b.HasIndex(x => x.CreatedBy).HasDatabaseName("ix_learning_materials_created_by");
        b.HasIndex(x => x.UpdatedAt).HasDatabaseName("ix_learning_materials_updated_at");
        b.HasIndex(x => x.IsDeleted).HasDatabaseName("ix_learning_materials_is_deleted");
        b.HasIndex(x => x.ClusterCode).HasDatabaseName("ix_learning_materials_cluster_code");
        b.HasIndex(x => x.StepNumber).HasDatabaseName("ix_learning_materials_step_number");

        b.HasMany(x => x.Instructors).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.QuizQuestions).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.Attachments).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.DbLinks).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.ModerationLogs).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.MicroVideos).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.InVideoQuizzes).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.PracticeRubrics).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.Faqs).WithOne().HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class LearningMaterialInstructorConfiguration : IEntityTypeConfiguration<LearningMaterialInstructor>
{
    public void Configure(EntityTypeBuilder<LearningMaterialInstructor> b)
    {
        b.ToTable("learning_material_instructors", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.FullName).HasMaxLength(150).IsRequired();
        b.Property(x => x.TitleDegree).HasMaxLength(150);
        b.Property(x => x.OrgName).HasMaxLength(250);
        b.Property(x => x.AvatarUrl).HasMaxLength(500);
        b.Property(x => x.RoleDescription).HasMaxLength(250);
        b.Property(x => x.IsLead).HasDefaultValue(false);
        b.Property(x => x.DisplayOrder).IsRequired();

        b.HasIndex(x => new { x.MaterialId, x.ExpertProfileId }).IsUnique().HasDatabaseName("ix_learning_material_instructors_unique");
        b.HasIndex(x => x.ExpertProfileId).HasDatabaseName("ix_learning_material_instructors_expert");
    }
}

public sealed class LearningQuizQuestionConfiguration : IEntityTypeConfiguration<LearningQuizQuestion>
{
    public void Configure(EntityTypeBuilder<LearningQuizQuestion> b)
    {
        b.ToTable("learning_quiz_questions", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.QuestionText).HasMaxLength(500).IsRequired();
        b.Property(x => x.OptionA).HasMaxLength(200).IsRequired();
        b.Property(x => x.OptionB).HasMaxLength(200).IsRequired();
        b.Property(x => x.OptionC).HasMaxLength(200).IsRequired();
        b.Property(x => x.OptionD).HasMaxLength(200).IsRequired();
        b.Property(x => x.CorrectOption).HasMaxLength(1).IsRequired();
        b.Property(x => x.Explanation).HasMaxLength(1000).IsRequired();
        b.Property(x => x.HasLengthWarning).HasDefaultValue(false);

        b.HasIndex(x => new { x.MaterialId, x.DisplayOrder }).IsUnique().HasDatabaseName("ix_learning_quiz_questions_order_unique");
    }
}

public sealed class LearningAttachmentConfiguration : IEntityTypeConfiguration<LearningAttachment>
{
    public void Configure(EntityTypeBuilder<LearningAttachment> b)
    {
        b.ToTable("learning_attachments", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.Category).HasMaxLength(30).IsRequired();
        b.Property(x => x.FileName).HasMaxLength(255).IsRequired();
        b.Property(x => x.StorageKey).HasMaxLength(500).IsRequired();
        b.Property(x => x.ContentType).HasMaxLength(100).IsRequired();
        b.Property(x => x.FileSizeBytes).IsRequired();
        b.Property(x => x.Sha256Hash).HasMaxLength(64);
        b.Property(x => x.DisplayOrder).HasDefaultValue(1);

        b.HasIndex(x => new { x.MaterialId, x.Category }).HasDatabaseName("ix_learning_attachments_material_category");
    }
}

public sealed class LearningDbLinkConfiguration : IEntityTypeConfiguration<LearningDbLink>
{
    public void Configure(EntityTypeBuilder<LearningDbLink> b)
    {
        b.ToTable("learning_db_links", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.DisplayLabel).HasMaxLength(100);
        b.Property(x => x.Description).HasMaxLength(250);
        b.Property(x => x.TargetUrl).HasMaxLength(500).IsRequired();
        b.Property(x => x.TargetEntityType).HasMaxLength(50);
        b.Property(x => x.TargetCode).HasMaxLength(50);
        b.Property(x => x.DisplayOrder).IsRequired();

        b.HasIndex(x => new { x.MaterialId, x.DisplayOrder }).HasDatabaseName("ix_learning_db_links_order");
    }
}

public sealed class LearningModerationLogConfiguration : IEntityTypeConfiguration<LearningModerationLog>
{
    public void Configure(EntityTypeBuilder<LearningModerationLog> b)
    {
        b.ToTable("learning_moderation_logs", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.Action).HasMaxLength(30).IsRequired();
        b.Property(x => x.Reason).HasMaxLength(250);
        b.Property(x => x.ActorName).HasMaxLength(150).IsRequired();
        b.Property(x => x.OldStatus).HasMaxLength(20);
        b.Property(x => x.NewStatus).HasMaxLength(20);

        b.HasIndex(x => new { x.MaterialId, x.OccurredAt }).HasDatabaseName("ix_learning_moderation_logs_material_date");
    }
}

public sealed class LearnerProgressConfiguration : IEntityTypeConfiguration<LearnerProgress>
{
    public void Configure(EntityTypeBuilder<LearnerProgress> b)
    {
        b.ToTable("learner_progress", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.WatchedSeconds).HasDefaultValue(0);
        b.Property(x => x.ProgressPercent).HasDefaultValue(0);
        b.Property(x => x.BestQuizScore).HasDefaultValue(0);
        b.Property(x => x.QuizAttemptsCount).HasDefaultValue(0);
        b.Property(x => x.IsCompleted).HasDefaultValue(false);

        b.HasIndex(x => new { x.MaterialId, x.PersonId }).IsUnique().HasDatabaseName("ix_learner_progress_material_person_unique");
        b.HasIndex(x => new { x.PersonId, x.IsCompleted }).HasDatabaseName("ix_learner_progress_person_completed");
    }
}

public sealed class LearnerQuizAttemptConfiguration : IEntityTypeConfiguration<LearnerQuizAttempt>
{
    public void Configure(EntityTypeBuilder<LearnerQuizAttempt> b)
    {
        b.ToTable("learner_quiz_attempts", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.AttemptCount).HasDefaultValue(1);
        b.Property(x => x.AnswersJson).HasColumnType("jsonb").IsRequired();
        b.Property(x => x.Passed).HasDefaultValue(false);

        b.HasIndex(x => new { x.MaterialId, x.PersonId }).HasDatabaseName("ix_learner_quiz_attempts_material_person");
        b.HasIndex(x => new { x.PersonId, x.SubmittedAt }).HasDatabaseName("ix_learner_quiz_attempts_person_date");
    }
}

public sealed class LearningMicroVideoConfiguration : IEntityTypeConfiguration<LearningMicroVideo>
{
    public void Configure(EntityTypeBuilder<LearningMicroVideo> b)
    {
        b.ToTable("learning_micro_videos", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.VideoOrder).IsRequired();
        b.Property(x => x.VideoCode).HasMaxLength(30).IsRequired();
        b.Property(x => x.Title).HasMaxLength(250).IsRequired();
        b.Property(x => x.DurationSeconds).HasDefaultValue(0);
        b.Property(x => x.VideoStorageKey).HasMaxLength(500);
        b.Property(x => x.VideoFileName).HasMaxLength(255);
        b.Property(x => x.ThumbnailUrl).HasMaxLength(500);
        b.Property(x => x.CallSheetJson).HasColumnType("jsonb");

        b.HasIndex(x => new { x.MaterialId, x.VideoOrder }).IsUnique().HasDatabaseName("uq_learning_micro_videos_order");
        b.HasIndex(x => x.MaterialId).HasDatabaseName("ix_learning_micro_videos_material");
    }
}

public sealed class LearningInVideoQuizConfiguration : IEntityTypeConfiguration<LearningInVideoQuiz>
{
    public void Configure(EntityTypeBuilder<LearningInVideoQuiz> b)
    {
        b.ToTable("learning_in_video_quizzes", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.QuizCode).HasMaxLength(20).IsRequired();
        b.Property(x => x.TriggerSeconds).IsRequired();
        b.Property(x => x.AfterScene).HasMaxLength(50);
        b.Property(x => x.QuestionText).HasMaxLength(500).IsRequired();
        b.Property(x => x.OptionA).HasMaxLength(250).IsRequired();
        b.Property(x => x.OptionB).HasMaxLength(250).IsRequired();
        b.Property(x => x.OptionC).HasMaxLength(250).IsRequired();
        b.Property(x => x.OptionD).HasMaxLength(250).IsRequired();
        b.Property(x => x.CorrectOption).HasMaxLength(1).IsRequired();
        b.Property(x => x.Explanation).HasMaxLength(1000).IsRequired();
        b.Property(x => x.DisplayOrder).HasDefaultValue(1);

        b.HasIndex(x => new { x.MaterialId, x.QuizCode }).IsUnique().HasDatabaseName("uq_learning_in_video_quizzes_code");
        b.HasIndex(x => new { x.MaterialId, x.TriggerSeconds }).HasDatabaseName("ix_learning_in_video_quizzes_trigger");
    }
}

public sealed class LearningPracticeRubricConfiguration : IEntityTypeConfiguration<LearningPracticeRubric>
{
    public void Configure(EntityTypeBuilder<LearningPracticeRubric> b)
    {
        b.ToTable("learning_practice_rubrics", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.CriterionNumber).IsRequired();
        b.Property(x => x.CriterionName).HasMaxLength(250).IsRequired();
        b.Property(x => x.DescriptionScore0).HasColumnName("description_score_0").HasMaxLength(500).IsRequired();
        b.Property(x => x.DescriptionScore1).HasColumnName("description_score_1").HasMaxLength(500).IsRequired();
        b.Property(x => x.DescriptionScore2).HasColumnName("description_score_2").HasMaxLength(500).IsRequired();
        b.Property(x => x.WeightMultiplier).HasDefaultValue(1);

        b.HasIndex(x => new { x.MaterialId, x.CriterionNumber }).IsUnique().HasDatabaseName("uq_learning_practice_rubrics_criterion");
        b.HasIndex(x => x.MaterialId).HasDatabaseName("ix_learning_practice_rubrics_material");
    }
}

public sealed class LearningFaqConfiguration : IEntityTypeConfiguration<LearningFaq>
{
    public void Configure(EntityTypeBuilder<LearningFaq> b)
    {
        b.ToTable("learning_faqs", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.QuestionNumber).IsRequired();
        b.Property(x => x.QuestionText).HasMaxLength(500).IsRequired();
        b.Property(x => x.AnswerText).IsRequired();
        b.Property(x => x.DisplayOrder).HasDefaultValue(1);

        b.HasIndex(x => new { x.MaterialId, x.QuestionNumber }).IsUnique().HasDatabaseName("uq_learning_faqs_question");
        b.HasIndex(x => x.MaterialId).HasDatabaseName("ix_learning_faqs_material");
    }
}

public sealed class LearnerPracticeEvaluationConfiguration : IEntityTypeConfiguration<LearnerPracticeEvaluation>
{
    public void Configure(EntityTypeBuilder<LearnerPracticeEvaluation> b)
    {
        b.ToTable("learner_practice_evaluations", LmsModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.RubricScoresJson).HasColumnType("jsonb").IsRequired();
        b.Property(x => x.EssayAnswersJson).HasColumnType("jsonb");
        b.Property(x => x.TotalScore).IsRequired();
        b.Property(x => x.MaxScore).HasDefaultValue(14);
        b.Property(x => x.PassThreshold).HasDefaultValue(11);
        b.Property(x => x.IsUnlockedCta).HasDefaultValue(false);
        b.Property(x => x.ExpertConsultationRequested).HasDefaultValue(false);
        b.Property(x => x.DemandProfileCreated).HasDefaultValue(false);

        b.HasIndex(x => new { x.MaterialId, x.PersonId }).HasDatabaseName("ix_learner_practice_evaluations_person_material");
    }
}
