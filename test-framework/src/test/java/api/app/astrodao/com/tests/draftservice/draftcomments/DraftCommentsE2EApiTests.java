package api.app.astrodao.com.tests.draftservice.draftcomments;

import api.app.astrodao.com.openapi.models.DraftCommentPageResponse;
import api.app.astrodao.com.openapi.models.DraftCommentResponse;
import api.app.astrodao.com.steps.draftservice.DraftCommentsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import jdk.jfr.Description;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

import static java.net.HttpURLConnection.HTTP_CREATED;
import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("draftCommentsE2EApiTests")})
@Epic("Draft Comments")
@Feature("Draft Comments E2E API tests")
@DisplayName("Draft Comments E2E API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftCommentsE2EApiTests extends BaseTest {
	public final DraftCommentsApiSteps draftCommentsApiSteps;
	private final Faker faker;

	@Value("${test.dao1}")
	private String testDao;

	@Value("${accounts.account1.accountId}")
	private String testAccountId;

	@Value("${accounts.account1.token}")
	private String authToken;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("CRUD operation with like/remove-line actions for draft comments endpoints")
	@DisplayName("CRUD operation with like/remove-line actions for draft comments endpoints")
	@Description("Following 'Draft Comments' endpoints were triggered: " +
			"POST|GET /api/v1/draft-comments; " +
			"PATCH /api/v1/draft-comments/{id}; " +
			"POST /api/v1/draft-comments/{id}/like; " +
			"POST /api/v1/draft-comments/{id}/remove-like; " +
			"DELETE /api/v1/draft-comments/{id}")
	void crudOperationWithLikeRemoveLikeActionsForDraftCommentsEndpoints() {
		//create comment
		String contextId = "632b322d5176bb0008d7d997";
		String comment1 = faker.backToTheFuture().quote();

		String commentId1 = draftCommentsApiSteps.createDraftComment(contextId, comment1, authToken).then()
				.statusCode(HTTP_CREATED)
				.extract().body().asString();


		//get created comment
		Map<String, Object> query = Map.of(
				"contextType", "DraftProposal",
				"search", comment1,
				"contextId", contextId
		);

		DraftCommentPageResponse draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertDtoValueGreaterThan(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getTotal().intValue(), 1, "total");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getId, commentId1, "id");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextId, contextId, "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getAuthor, testAccountId, "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getMessage().equals(comment1), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getReplies().isEmpty(), "replies");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getLikeAccounts().isEmpty(), "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getDislikeAccounts().isEmpty(), "dislikeAccounts");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getCreatedAt().toString().isEmpty(), "createdAt");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getUpdatedAt().toString().isEmpty(), "updatedAt");

		//update created comment PATCH

	}
}
