package api.app.astrodao.com.tests.draftservice.draftcomments;

import api.app.astrodao.com.openapi.models.DraftCommentPageResponse;
import api.app.astrodao.com.openapi.models.DraftCommentResponse;
import api.app.astrodao.com.steps.draftservice.DraftCommentsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("draftCommentsApiTests")})
@Epic("Draft Comments")
@Feature("/draft-comments API tests")
@DisplayName("/draft-comments API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftCommentsApiTests extends BaseTest {
	public final DraftCommentsApiSteps draftCommentsApiSteps;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft comments with query param: [limit, offset, order, contextType]")
	@DisplayName("Get list of draft comments with query param: [limit, offset, order, contextType]")
	void getListOfDraftCommentsWithQueryParamsLimitOffsetOrderContextType() {
		int limit = 5;
		int offset = 5;
		Map<String, Object> query = Map.of(
				"limit", limit,
				"offset", offset,
				"order", "DESC",
				"contextType", "DraftProposal"
		);

		DraftCommentPageResponse draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getLimit().intValue(), limit, "limit");
		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getOffset().intValue(), offset, "offset");
		draftCommentsApiSteps.assertDtoValueGreaterThan(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getTotal().intValue(), 319, "total");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getId().isEmpty(), "id");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getContextId().isEmpty(), "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getAuthor().isEmpty(), "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getMessage().isEmpty(), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getReplies() != null, "replies");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getLikeAccounts() != null, "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getDislikeAccounts() != null, "dislikeAccounts");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getCreatedAt().toString().isEmpty(), "createdAt");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getUpdatedAt().toString().isEmpty(), "updatedAt");

		List<OffsetDateTime> createdAtList = draftCommentPageResponse.getData().stream().map(DraftCommentResponse::getCreatedAt).collect(Collectors.toList());
		draftCommentsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                               "Draft comments should be sorted by 'createdAt' field in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft comments with query param: [search, contextId]")
	@DisplayName("Get list of draft comments with query param: [search, contextId]")
	void getListOfDraftCommentsWithQueryParamsSearchContextId() {
		String contextId = "62c5b1cef8fdd40008211ccc";
		String message = "SDFG SDFG SDFGSFD";
		Map<String, Object> query = Map.of(
				"search", message,
				"contextId", contextId
		);

		DraftCommentPageResponse draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getLimit().intValue(), 10, "limit");
		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getOffset().intValue(), 0, "offset");
		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getTotal().intValue(), 1, "total");

		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getId, "62c5b26ff8fdd40008211cd1", "id");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextId, contextId, "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getAuthor, "jdnear001.testnet", "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getMessage().contains(message), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().noneMatch(
						draftCommentReply ->
								draftCommentReply.getId().isEmpty()), "replies/id");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getContextId().equals(contextId)), "replies/contextId");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getContextType().equals(DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL)), "replies/contextType");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getAuthor().equals("jdnear002.testnet")), "replies/author");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().noneMatch(
						draftCommentReply ->
								draftCommentReply.getMessage().isEmpty()), "replies/message");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getReplyTo().equals("62c5b26ff8fdd40008211cd1")), "replies/replyTo");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getLikeAccounts().isEmpty()), "replies/likeAccounts");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().noneMatch(
						draftCommentReply ->
								draftCommentReply.getCreatedAt().toString().isEmpty()), "replies/createdAt");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().noneMatch(
						draftCommentReply ->
								draftCommentReply.getUpdatedAt().toString().isEmpty()), "replies/updatedAt");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getLikeAccounts().isEmpty(), "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getCreatedAt().toString().isEmpty(), "createdAt");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getUpdatedAt().toString().isEmpty(), "updatedAt");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft comments with query param: [orderBy, order, isReply=true]")
	@DisplayName("Get list of draft comments with query param: [orderBy, order, isReply=true]")
	void getListOfDraftCommentsWithQueryParamsOrderByOrderIsReply() {
		Map<String, Object> query = Map.of(
				"orderBy", "updatedAt",
				"order", "ASC",
				"isReply", "true"
		);

		DraftCommentPageResponse draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getId().isEmpty(), "id");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getContextId().isEmpty(), "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getAuthor().isEmpty(), "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getMessage().isEmpty(), "message");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getReplyTo().isEmpty(), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getReplies().isEmpty(), "replies");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getLikeAccounts().isEmpty(), "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getDislikeAccounts().isEmpty(), "dislikeAccounts");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getCreatedAt().toString().isEmpty(), "createdAt");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getUpdatedAt().toString().isEmpty(), "updatedAt");

		List<OffsetDateTime> createdAtList = draftCommentPageResponse.getData().stream().map(DraftCommentResponse::getCreatedAt).collect(Collectors.toList());
		draftCommentsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.naturalOrder(),
		                                                              "Draft comments should be sorted by 'updatedAt' field in ASC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft comments with query param: [search, contextType, isReply=false]")
	@DisplayName("Get list of draft comments with query param: [search, contextType, isReply=false]")
	void getListOfDraftCommentsWithQueryParamsContextTypeIsReply() {
		String message = "automation test1";
		String id = "6329dd483bbfd900084ded78";
		String contextId = "6329dcd03bbfd900084ded75";
		Map<String, Object> query = Map.of(
				"search", message,
				"isReply", "false",
				"contextType", "DraftProposal"
		);

		DraftCommentPageResponse draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getId, id, "id");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextId, contextId, "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getAuthor, "sputnikautomation1.testnet", "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getMessage().contains(message), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getReplies().isEmpty(), "replies");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getContextId().equals(contextId)), "replies/contextId");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getContextType().equals(DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL)), "replies/contextType");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getAuthor().equals("sputnikautomation1.testnet")), "replies/author");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getMessage().contains("automation test2")), "replies/message");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getReplyTo().equals(id)), "replies/replyTo");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().allMatch(
						draftCommentReply ->
								draftCommentReply.getLikeAccounts().isEmpty()), "replies/likeAccounts");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().noneMatch(
						draftCommentReply ->
								draftCommentReply.getCreatedAt().toString().isEmpty()), "replies/createdAt");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftComment ->
				draftComment.getReplies().stream().noneMatch(
						draftCommentReply ->
								draftCommentReply.getUpdatedAt().toString().isEmpty()), "replies/updatedAt");


		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getLikeAccounts().isEmpty(), "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getDislikeAccounts().isEmpty(), "dislikeAccounts");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getCreatedAt().toString().isEmpty(), "createdAt");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getUpdatedAt().toString().isEmpty(), "updatedAt");
	}
}