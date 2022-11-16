package api.app.astrodao.com.tests.draftservice.draftcomments;

import api.app.astrodao.com.openapi.models.DraftCommentPageResponse;
import api.app.astrodao.com.openapi.models.DraftCommentResponse;
import api.app.astrodao.com.steps.draftservice.DraftCommentsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import jdk.jfr.Description;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.parallel.Execution;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;

import static java.net.HttpURLConnection.HTTP_CREATED;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasToString;
import static org.junit.jupiter.api.parallel.ExecutionMode.SAME_THREAD;

@Tags({@Tag("all"), @Tag("draftCommentsE2EApiTests")})
@Epic("Draft Comments")
@Feature("Draft Comments E2E API tests")
@DisplayName("Draft Comments E2E API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
@Execution(SAME_THREAD)
public class DraftCommentsE2EApiTests extends BaseTest {
	public final DraftCommentsApiSteps draftCommentsApiSteps;
	private final Faker faker;


	@Value("${accounts.account1.accountId}")
	private String testAccount1Id;

	@Value("${accounts.account2.accountId}")
	private String testAccount2Id;

	@Value("${accounts.account1.token}")
	private String authToken1;

	@Value("${accounts.account2.token}")
	private String authToken2;

	@Value("${test.dao1}")
	private String testDao;


	@BeforeAll
	public void deleteAllComments() {
		draftCommentsApiSteps.deleteAllComments(testDao, authToken1);
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("CRUD operation with like/remove-line actions for draft comments endpoints")
	@DisplayName("CRUD operation with like/remove-line actions for draft comments endpoints")
	@Description("Following 'Draft Comments' endpoints were triggered: " +
			"POST|GET /api/v1/draft-comments; " +
			"PATCH /api/v1/draft-comments/{daoId}/{draftId}/{commentId}; " +
			"POST /api/v1/draft-comments/{daoId}/{draftId}/{commentId}/like; " +
			"POST /api/v1/draft-comments/{daoId}/{draftId}/{commentId}/remove-like; " +
			"DELETE /api/v1/draft-comments/{daoId}/{draftId}/{commentId}")
	void crudOperationWithLikeRemoveLikeActionsForDraftCommentsEndpoints() {
		//create comment
		//dao test-dao-1641395769436.sputnikv2.testnet
		String draftId = "6332ae623b5f700008b15b62";
		String comment1 = faker.yoda().quote();
		DraftCommentPageResponse draftCommentPageResponse;
		Map<String, Object> query;

		//comment by user2
		String commentId = draftCommentsApiSteps.createDraftComment(testDao, draftId, comment1, authToken2).then()
				.statusCode(HTTP_CREATED)
				.extract().body().asString();


		//get created comment
		query = Map.of(
				"contextType", "DraftProposal",
				"search", comment1,
				"contextId", draftId
		);

		draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getTotal().intValue(), 1, "total");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getId, commentId, "id");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextId, draftId, "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getAuthor, testAccount2Id, "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getMessage().equals(comment1), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getReplies().isEmpty(), "replies");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getLikeAccounts().isEmpty(), "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getDislikeAccounts().isEmpty(), "dislikeAccounts");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getCreatedAt().toString().isEmpty(), "createdAt");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getUpdatedAt().toString().isEmpty(), "updatedAt");

		//update created comment
		String comment2 = "Updated message is: " + faker.chuckNorris().fact();
		draftCommentsApiSteps.updateDraftComment(testDao, draftId, commentId, comment2, authToken2).then()
				.statusCode(HTTP_OK)
				.body("", hasToString(commentId));


		// like draft comment
		draftCommentsApiSteps.likeDraftComment(testDao, draftId, commentId, authToken1).then()
				.statusCode(HTTP_CREATED)
				.body("", hasToString("true"));


		//get updated comment with like
		query = Map.of(
				"contextType", "DraftProposal",
				"search", comment2,
				"contextId", draftId
		);

		draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getTotal().intValue(), 1, "total");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getId, commentId, "id");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextId, draftId, "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getAuthor, testAccount2Id, "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getMessage().equals(comment2), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getReplies().isEmpty(), "replies");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getLikeAccounts, List.of(testAccount1Id), "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getDislikeAccounts().isEmpty(), "dislikeAccounts");


		// remove like from draft comment
		draftCommentsApiSteps.removeLikeFromDraftComment(testDao, draftId, commentId, authToken1).then()
				.statusCode(HTTP_CREATED)
				.body("", hasToString("true"));


		//get updated comment with removed like
		draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getTotal().intValue(), 1, "total");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getId, commentId, "id");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextId, draftId, "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getAuthor, testAccount2Id, "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getMessage().equals(comment2), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getReplies().isEmpty(), "replies");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getLikeAccounts().isEmpty(), "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getDislikeAccounts().isEmpty(), "dislikeAccounts");


		//delete draft comment
		draftCommentsApiSteps.deleteDraftComment(testDao, draftId, commentId, authToken1).then()
				.statusCode(HTTP_OK)
				.body("id", equalTo(commentId),
				      "deleted", equalTo(true));
	}
}
