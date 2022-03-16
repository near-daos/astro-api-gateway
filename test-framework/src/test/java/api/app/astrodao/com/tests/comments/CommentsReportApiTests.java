package api.app.astrodao.com.tests.comments;

import api.app.astrodao.com.core.dto.api.comments.CreatedComment;
import api.app.astrodao.com.core.utils.WaitUtils;
import api.app.astrodao.com.openapi.models.Comment;
import api.app.astrodao.com.openapi.models.CommentReport;
import api.app.astrodao.com.openapi.models.CommentResponse;
import api.app.astrodao.com.steps.CommentsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import api.app.astrodao.com.core.enums.HttpStatus;

import java.util.Map;

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

	@Value("${test.proposal}")
	private String testProposal;

	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Value("${accounts.account1.publicKey}")
	private String account1PublicKey;

	@Value("${accounts.account1.signature}")
	private String account1Signature;

	@Value("${accounts.account2.accountId}")
	private String account2Id;

	@Value("${accounts.account2.publicKey}")
	private String account2PublicKey;

	@Value("${accounts.account2.signature}")
	private String account2Signature;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be to submit new report for a comment")
	@DisplayName("User should be to submit new report for a comment")
	void createNewReportForComment() {
		String contextType = "Proposal";
		String reason = "Spam";
		String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

		Map<String, Object> queryToGetCreatedComment = Map.of(
				"sort", "createdAt,DESC",
				"s", String.format("{\"message\": \"%s\"}", commentMsg)
		);

		Response newCommentResponse = commentsApiSteps.createComment(
				account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg
		);
		commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.CREATED);

		CreatedComment createdComment = commentsApiSteps.getResponseDto(newCommentResponse, CreatedComment.class);

		Response newReportResponse = commentsApiSteps.reportComment(account2Id, account2PublicKey, account2Signature, createdComment.getId(), reason);
		commentsApiSteps.assertResponseStatusCode(newReportResponse, HttpStatus.CREATED);

		Response commentsResponse = commentsApiSteps.getComments(queryToGetCreatedComment);
		commentsApiSteps.assertResponseStatusCode(commentsResponse, HttpStatus.OK);

		CommentResponse commentResponse = commentsApiSteps.getResponseDto(commentsResponse, CommentResponse.class);
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
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should not be to submit new report for a comment (by using invalid public key)")
	@DisplayName("User should not be to submit new report for a comment (by using invalid public key)")
	void createNewReportForCommentWithInvalidPublicKey() {
		String contextType = "Proposal";
		String reason = "Spam";
		String errorMsg = String.format("Account %s identity is invalid - public key", account2Id);
		String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

		Response newCommentResponse = commentsApiSteps.createComment(
				account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg
		);
		commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.CREATED);

		CreatedComment createdComment = commentsApiSteps.getResponseDto(newCommentResponse, CreatedComment.class);
		Response reportResponse = commentsApiSteps.reportComment(account2Id, account1PublicKey, account2Signature, createdComment.getId(), reason);

		commentsApiSteps.assertResponseStatusCode(reportResponse, HttpStatus.FORBIDDEN);
		commentsApiSteps.assertStringContainsValue(reportResponse.body().asString(), errorMsg);
	}
}
