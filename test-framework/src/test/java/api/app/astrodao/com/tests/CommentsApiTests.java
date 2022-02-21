package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.comments.CreatedComment;
import api.app.astrodao.com.core.utils.WaitUtils;
import api.app.astrodao.com.openapi.models.Comment;
import api.app.astrodao.com.openapi.models.CommentReport;
import api.app.astrodao.com.openapi.models.CommentResponse;
import api.app.astrodao.com.steps.CommentsApiSteps;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Map;

@Tags({@Tag("all"), @Tag("commentsApiTests")})
@Feature("COMMENTS API TESTS")
@DisplayName("COMMENTS API TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class CommentsApiTests extends BaseTest {
    private final CommentsApiSteps commentsApiSteps;
    private final Faker faker;

    @Value("${test.dao}")
    private String testDao;

    @Value("${test.proposal}")
    private String testProposal;

    @Value("${test.bounty}")
    private String testBounty;

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
    @Story("User should be able to get list of comments with query param: [sort, limit, offset]")
    void getListOfCommentsWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), limit, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), limit, "limit");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), limit);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> !r.getMessage().isBlank(), "message");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of comments with query param: [sort, limit, offset]")
    void getListOfCommentsWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "page", page
        );
        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "limit");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> !r.getMessage().isBlank(), "message");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of comments with query param: [sort, fields]")
    void getListOfCommentsWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort", "id,DESC",
                "fields", "id,message"
        );
        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> r.getId().longValue() > 0, "id");
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> !r.getMessage().isBlank(), "message");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getDaoId() == null, "daoId");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getProposalId() == null, "proposalId");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getContextId() == null, "contextId");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getContextType() == null, "contextType");
        //TODO: Ask a question comment with 229 ID has a report data
        //commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getReports().isEmpty(), "reports");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getAccountId() == null, "accountId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of comments with query param: [sort, s]")
    void getListOfCommentsSortSParams() {
        int count = 50;
        int page = 1;
        String accountId = "anima.testnet";
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"accountId\": \"%s\"}", accountId)
        );

        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> r.getId().longValue() > 0, "id");
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> accountId.equals(r.getAccountId()), "accountId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Creating new comment for a proposal")
    void createNewCommentForProposal() {
        String contextType = "Proposal";
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        Map<String, Object> queryToGetCreatedComment = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"message\": \"%s\"}", commentMsg)
        );

        ResponseEntity<String> newCommentResponse = commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg
        );
        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.CREATED);

        CreatedComment createdComment = commentsApiSteps.getResponseDto(newCommentResponse, CreatedComment.class);
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getContextId, testProposal, "contextId");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getContextType, contextType, "contextType");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getMessage, commentMsg, "message");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getAccountId, account1Id, "accountId");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getPublicKey, account1PublicKey, "publicKey");
        commentsApiSteps.assertDtoHasValue(createdComment, CreatedComment::getId, "id");

        ResponseEntity<String> commentsResponse = commentsApiSteps.getComments(queryToGetCreatedComment);
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
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData().get(0).getReports(), 0);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Creating new comment for a proposal")
    void createNewCommentForBounty() {
        String contextType = "BountyContext";
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        Map<String, Object> queryToGetCreatedComment = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"message\": \"%s\"}", commentMsg)
        );

        ResponseEntity<String> newCommentResponse = commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature, testBounty, contextType, commentMsg
        );
        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.CREATED);

        CreatedComment createdComment = commentsApiSteps.getResponseDto(newCommentResponse, CreatedComment.class);
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getContextId, testBounty, "contextId");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getContextType, contextType, "contextType");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getMessage, commentMsg, "message");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getAccountId, account1Id, "accountId");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getPublicKey, account1PublicKey, "publicKey");
        commentsApiSteps.assertDtoHasValue(createdComment, CreatedComment::getId, "id");

        ResponseEntity<String> commentsResponse = commentsApiSteps.getComments(queryToGetCreatedComment);
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
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getContextId, testBounty, "contextId");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getDaoId, testDao, "daoId");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getMessage, commentMsg, "message");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData().get(0).getReports(), 0);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to create comment for a proposal (by using invalid public key)")
    void createNewCommentForProposalWithInvalidPublicKey() {
        String contextType = "Proposal";
        String errorMsg = String.format("Account %s identity is invalid - public key", account1Id);
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        ResponseEntity<String> newCommentResponse = commentsApiSteps.createComment(
                account1Id, account2PublicKey, account1Signature, testProposal, contextType, commentMsg
        );

        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.FORBIDDEN);
        commentsApiSteps.assertStringContainsValue(newCommentResponse.getBody(), errorMsg);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to create comment for non-existing proposal")
    void createNewCommentForNonExistingProposal() {
        String contextType = "Proposal";
        String invalidContextId = "test-dao-1641395769436.sputnikv2.testnet-9111111";
        String errorMsg = String.format("Proposal with id %s not found", invalidContextId);
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        ResponseEntity<String> newCommentResponse = commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature, invalidContextId, contextType, commentMsg
        );

        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.NOT_FOUND);
        commentsApiSteps.assertStringContainsValue(newCommentResponse.getBody(), errorMsg);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be to submit new report for a comment")
    void createNewReportForComment() {
        String contextType = "Proposal";
        String reason = "Spam";
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        Map<String, Object> queryToGetCreatedComment = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"message\": \"%s\"}", commentMsg)
        );

        ResponseEntity<String> newCommentResponse = commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg
        );
        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.CREATED);

        CreatedComment createdComment = commentsApiSteps.getResponseDto(newCommentResponse, CreatedComment.class);

        ResponseEntity<String> newReportResponse = commentsApiSteps.reportComment(account2Id, account2PublicKey, account2Signature, createdComment.getId(), reason);
        commentsApiSteps.assertResponseStatusCode(newReportResponse, HttpStatus.CREATED);

        ResponseEntity<String> commentsResponse = commentsApiSteps.getComments(queryToGetCreatedComment);
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
    void createNewReportForCommentWithInvalidPublicKey() {
        String contextType = "Proposal";
        String reason = "Spam";
        String errorMsg = String.format("Account %s identity is invalid - public key", account2Id);
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        ResponseEntity<String> newCommentResponse = commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg
        );
        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.CREATED);

        CreatedComment createdComment = commentsApiSteps.getResponseDto(newCommentResponse, CreatedComment.class);
        ResponseEntity<String> reportResponse = commentsApiSteps.reportComment(account2Id, account1PublicKey, account2Signature, createdComment.getId(), reason);

        commentsApiSteps.assertResponseStatusCode(reportResponse, HttpStatus.FORBIDDEN);
        commentsApiSteps.assertStringContainsValue(reportResponse.getBody(), errorMsg);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to delete existing comment for a proposal")
    void deleteExistingCommentForProposal() {
        String contextType = "Proposal";
        String reason = "Language";
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        Map<String, Object> queryToGetCreatedComment = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"message\": \"%s\"}", commentMsg)
        );

        ResponseEntity<String> newCommentResponse = commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg
        );
        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.CREATED);
        CreatedComment createdComment = commentsApiSteps.getResponseDto(newCommentResponse, CreatedComment.class);

        ResponseEntity<String> deleteResponse = commentsApiSteps.deleteComment(account1Id, account1PublicKey, account1Signature, createdComment.getId(), reason);
        commentsApiSteps.assertResponseStatusCode(deleteResponse, HttpStatus.OK);

        ResponseEntity<String> commentsResponse = commentsApiSteps.getComments(queryToGetCreatedComment);
        commentsApiSteps.assertResponseStatusCode(commentsResponse, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(commentsResponse, CommentResponse.class);
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getTotal().intValue(), 0, "total");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), 1, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), 0, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), 0);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to delete non-existing comment for a proposal")
    void deleteNonExistingCommentForProposal() {
        String reason = "Language";
        BigDecimal invalidId = BigDecimal.valueOf(31313);
        String errorMsg = String.format("Comment with commentId %s not found", invalidId);

        ResponseEntity<String> deleteResponse = commentsApiSteps.deleteComment(
                account1Id, account1PublicKey, account1Signature, invalidId, reason
        );

        commentsApiSteps.assertResponseStatusCode(deleteResponse, HttpStatus.NOT_FOUND);
        commentsApiSteps.assertStringContainsValue(deleteResponse.getBody(), errorMsg);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to delete existing comment for a proposal (by using invalid public key)")
    void deleteExistingCommentForProposalWithInvalidPublicKey() {
        String contextType = "Proposal";
        String reason = "Language";
        String errorMsg = String.format("Account %s identity is invalid - public key", account1Id);
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        ResponseEntity<String> newCommentResponse = commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg
        );
        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.CREATED);
        CreatedComment createdComment = commentsApiSteps.getResponseDto(newCommentResponse, CreatedComment.class);

        ResponseEntity<String> deleteResponse = commentsApiSteps.deleteComment(account1Id, account2PublicKey, account1Signature, createdComment.getId(), reason);

        commentsApiSteps.assertResponseStatusCode(deleteResponse, HttpStatus.FORBIDDEN);
        commentsApiSteps.assertStringContainsValue(deleteResponse.getBody(), errorMsg);
    }
}
