package api.app.astrodao.com.tests.apiservice.comments;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.core.utils.WaitUtils;
import api.app.astrodao.com.openapi.models.Comment;
import api.app.astrodao.com.openapi.models.CommentReport;
import api.app.astrodao.com.openapi.models.CommentResponse;
import api.app.astrodao.com.steps.apiservice.CommentsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("commentsReportApiTests")})
@Epic("Comments")
@Feature("/comments/report API tests")
@DisplayName("/comments/report API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class CommentsReportApiTests extends BaseTest {
	private final CommentsApiSteps commentsApiSteps;
	private final Faker faker;

	@Value("${test.dao1}")
	private String testDao;

	@Value("${test.proposal1}")
	private String testProposal;

	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Value("${accounts.account1.publicKey}")
	private String account1PublicKey;

	@Value("${accounts.account1.token}")
	private String account1AuthToken;

	@Value("${accounts.account2.accountId}")
	private String account2Id;

	@Value("${accounts.account2.signature}")
	private String account2Signature;

	@Value("${accounts.account2.token}")
	private String account2AuthToken;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to submit new report for a comment")
	@DisplayName("User should be able to submit new report for a comment")
	void createNewReportForComment() {
		String contextType = "Proposal";
		String reason = "Spam";
		String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

		Map<String, Object> queryToGetCreatedComment = Map.of(
				"sort", "createdAt,DESC",
				"s", String.format("{\"message\": \"%s\"}", commentMsg)
		);

		Comment createdComment = commentsApiSteps.createComment(testProposal, contextType, commentMsg, account1AuthToken)
				.then()
				.statusCode(HTTP_CREATED)
				.extract().as(Comment.class);

		commentsApiSteps.reportComment(createdComment.getId(), reason, account2AuthToken)
				.then()
				.statusCode(HTTP_CREATED);

		CommentResponse commentResponse = commentsApiSteps.getComments(queryToGetCreatedComment).then()
				.statusCode(HTTP_OK)
				.extract().as(CommentResponse.class);

		commentsApiSteps.assertDtoValue(commentResponse, r -> r.getTotal().intValue(), 1, "total");
		commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), 1, "page");
		commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), 1, "count");
		commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), 1);
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getId, createdComment.getId(), "id");
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getAccountId, account1Id, "accountId");
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getContextType, contextType, "contextType");
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getContextId, testProposal, "contextId");
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getDaoId, testDao, "daoId");
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getMessage, commentMsg, "message");
		commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData().get(0).getReports(), 1);
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0).getReports().get(0), CommentReport::getCommentId, createdComment.getId(), "reports/commentId");
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0).getReports().get(0), CommentReport::getId, String.format("%s-%s", createdComment.getId(), account2Id), "reports/id");
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0).getReports().get(0), CommentReport::getAccountId, account2Id, "reports/accountId");
		commentsApiSteps.assertDtoValue(commentResponse.getData().get(0).getReports().get(0), CommentReport::getReason, reason, "reports/reason");
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("User should not be able to submit new report for a comment (by using invalid public key in authToken)")
	@DisplayName("User should not be able to submit new report for a comment (by using invalid public key in authToken)")
	void createNewReportForCommentWithInvalidPublicKeyInAuthToken() {
		String contextType = "Proposal";
		String reason = "Spam";
		String errorMsg = String.format("Account %s identity is invalid - public key", account2Id);
		String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);
		String invalidAuthToken = Base64Utils.encodeAuthToken(account2Id, account1PublicKey, account2Signature);

		Comment createdComment = commentsApiSteps.createComment(testProposal, contextType, commentMsg, account1AuthToken)
				.then()
				.statusCode(HTTP_CREATED)
				.extract().as(Comment.class);

		commentsApiSteps.reportComment(createdComment.getId(), reason, invalidAuthToken)
				.then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMsg),
				      "error", equalTo("Forbidden"));
	}
}
