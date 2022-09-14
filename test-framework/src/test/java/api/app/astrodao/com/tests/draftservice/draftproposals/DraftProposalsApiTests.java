package api.app.astrodao.com.tests.draftservice.draftproposals;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.openapi.models.*;
import api.app.astrodao.com.steps.draftservice.DraftProposalsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static api.app.astrodao.com.core.utils.WaitUtils.getLocalDateTime;
import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("draftProposalsApiTests")})
@Epic("Draft Proposals")
@Feature("/draft-proposals API tests")
@DisplayName("/draft-proposals API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsApiTests extends BaseTest {
	private final DraftProposalsApiSteps draftProposalsApiSteps;
	private final Faker faker;

	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Value("${accounts.account2.accountId}")
	private String account2Id;

	@Value("${test.dao1}")
	private String testDao;

	@Value("${accounts.account1.publicKey}")
	private String account1PublicKey;

	@Value("${accounts.account1.signature}")
	private String account1Signature;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft-proposals with query param: [limit, offset, orderBy, order]")
	@DisplayName("Get list of draft-proposals with query param: [limit, offset, orderBy, order]")
	void getListOfDraftProposalsWithQueryParamsLimitOffsetOrderByOrder() {
		int limit = 11;
		int offset = 10;
		Map<String, Object> query = Map.of(
				"limit", limit,
				"offset", offset,
				"orderBy","createdAt",
				"order", "DESC"
		);

		DraftPageResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposals(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftPageResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse1 -> draftPageResponse1.getLimit().intValue(), limit, "limit");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getOffset().intValue(), offset, "offset");
		draftProposalsApiSteps.assertDtoValueGreaterThan(draftProposalResponse, draftPageResponse -> draftPageResponse.getTotal().intValue(), 142, "total");

		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getId().isEmpty(), "id");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getDaoId().isEmpty(), "daoId");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getProposer().isEmpty(), "proposer");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getTitle().isEmpty(), "title");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getType().getValue().isEmpty(), "type");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getState().getValue().isEmpty(), "state");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getReplies().intValue() >= 0, "replies");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getViews().intValue() >= 0, "views");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getSaves().intValue() >= 0, "saves");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getUpdatedAt().toString().isEmpty(), "updatedAt");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getCreatedAt().toString().isEmpty(), "createdAt");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsRead(), "No boolean value for field:", "isRead");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsSaved(), "No boolean value for field:", "isSaved");

		List<OffsetDateTime> createdAtList = draftProposalResponse.getData().stream().map(DraftProposalBasicResponse::getCreatedAt).collect(Collectors.toList());
		draftProposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                              "Draft proposals should be sorted by 'createdAt' field in DESC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft-proposals with query param: [orderBy, order, state, isRead, isSaved]")
	@DisplayName("Get list of draft-proposals with query param: [orderBy, order, state, isRead, isSaved]")
	void getListOfDraftProposalsWithQueryParamsOrderByOrderStateIsReadIsSaved() {
		Map<String, Object> query = Map.of(
				"orderBy","updatedAt",
				"order", "ASC",
				"state", "open",
				"isRead", false,
				"isSaved", false
		);

		DraftPageResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposals(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftPageResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse1 -> draftPageResponse1.getLimit().intValue(), 10, "limit");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getOffset().intValue(), 0, "offset");
		draftProposalsApiSteps.assertDtoValueGreaterThan(draftProposalResponse, draftPageResponse -> draftPageResponse.getTotal().intValue(), 136, "total");

		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getId().isEmpty(), "id");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getDaoId().isEmpty(), "daoId");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getProposer().isEmpty(), "proposer");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getTitle().isEmpty(), "title");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getType().getValue().isEmpty(), "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getState, DraftProposalState.OPEN, "state");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getReplies().intValue() >= 0, "replies");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getViews().intValue() >= 0, "views");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getSaves().intValue() >= 0, "saves");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getUpdatedAt().toString().isEmpty(), "updatedAt");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getCreatedAt().toString().isEmpty(), "createdAt");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsRead(), "No boolean value for field:", "isRead");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsSaved(), "No boolean value for field:", "isSaved");

		List<OffsetDateTime> updatedAtList = draftProposalResponse.getData().stream().map(DraftProposalBasicResponse::getUpdatedAt).collect(Collectors.toList());
		draftProposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(updatedAtList, Comparator.naturalOrder(),
		                                                               "Draft proposals should be sorted by 'updatedAt' field in ASC order");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft-proposals with query param: [accountId, isRead, isSaved]")
	@DisplayName("Get list of draft-proposals with query param: [accountId, isRead, isSaved]")
	void getListOfDraftProposalsWithQueryParamsAccountIdIsReadIsSaved() {
		Map<String, Object> query = Map.of(
				"accountId", account2Id,
				"isRead", true,
				"isSaved", true
		);

		DraftPageResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposals(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftPageResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getLimit().intValue(), 10, "limit");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getOffset().intValue(), 0, "offset");
		draftProposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(draftProposalResponse, draftPageResponse -> draftPageResponse.getTotal().intValue(), 2, "total");

		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getId().isEmpty(), "id");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getDaoId().isEmpty(), "daoId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getProposer, account2Id, "proposer");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getTitle().isEmpty(), "title");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getType().getValue().isEmpty(), "type");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getState().getValue().isEmpty(), "state");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getReplies().intValue() >= 0, "replies");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getViews().intValue() >= 1, "views");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getSaves().intValue() >= 1, "saves");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getUpdatedAt().toString().isEmpty(), "updatedAt");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getCreatedAt().toString().isEmpty(), "createdAt");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), DraftProposalBasicResponse::getIsRead, "No boolean value for field:", "isRead");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), DraftProposalBasicResponse::getIsSaved, "No boolean value for field:", "isSaved");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft-proposals with query param: [type, state]")
	@DisplayName("Get list of draft-proposals with query param: [type, state]")
	void getListOfDraftProposalsWithQueryParamsTypeState() {
		Map<String, Object> query = Map.of(
				"type", "Transfer",
				"state", "closed"
		);

		DraftPageResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposals(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftPageResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getLimit().intValue(), 10, "limit");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getOffset().intValue(), 0, "offset");
		draftProposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(draftProposalResponse, draftPageResponse -> draftPageResponse.getTotal().intValue(), 9, "total");

		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getId().isEmpty(), "id");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getDaoId().isEmpty(), "daoId");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getProposer().isEmpty(), "proposer");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getTitle().isEmpty(), "title");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getType, ProposalType.TRANSFER, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getState, DraftProposalState.CLOSED, "state");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getReplies().intValue() >= 0, "replies");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getViews().intValue() >= 0, "views");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getSaves().intValue() >= 0, "saves");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getUpdatedAt().toString().isEmpty(), "updatedAt");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getCreatedAt().toString().isEmpty(), "createdAt");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsRead(), "No boolean value for field:", "isRead");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsSaved(), "No boolean value for field:", "isSaved");

		List<OffsetDateTime> createdAtList = draftProposalResponse.getData().stream().map(DraftProposalBasicResponse::getCreatedAt).collect(Collectors.toList());
		draftProposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                               "'Order' param is not set. Draft proposals should be sorted by 'createdAt' field in DESC order by default");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft-proposals with query param: [search]")
	@DisplayName("Get list of draft-proposals with query param: [search]")
	void getListOfDraftProposalsWithQueryParamsSearch() {
		Map<String, Object> query = Map.of(
				"search", "Test draft proposal. N1"
		);

		DraftPageResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposals(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftPageResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getLimit().intValue(), 10, "limit");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getOffset().intValue(), 0, "offset");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getTotal().intValue(), 1, "total");

		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getId, "62ed05c6520e2e000821f54f", "id");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getDaoId, "test-dao-for-ui-uno.sputnikv2.testnet", "daoId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getProposer, account2Id, "proposer");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getTitle, "Test draft proposal. N1", "title");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getType, ProposalType.TRANSFER, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getState, DraftProposalState.OPEN, "state");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getReplies().intValue() == 0, "replies");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getViews().intValue() == 1, "views");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getSaves().intValue() == 1, "saves");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getUpdatedAt().toString().isEmpty(), "updatedAt");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getCreatedAt().toString().isEmpty(), "createdAt");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsRead(), "No boolean value for field:", "isRead");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsSaved(), "No boolean value for field:", "isSaved");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft-proposals with query param: [daoId]")
	@DisplayName("Get list of draft-proposals with query param: [daoId]")
	void getListOfDraftProposalsWithQueryParamsDaoId() {
		String daoId = "test-dao-for-ui-uno.sputnikv2.testnet";
		Map<String, Object> query = Map.of(
				"daoId", daoId
		);

		DraftPageResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposals(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftPageResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getLimit().intValue(), 10, "limit");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getOffset().intValue(), 0, "offset");
		draftProposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(draftProposalResponse, draftPageResponse -> draftPageResponse.getTotal().intValue(), 4, "total");

		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getId().isEmpty(), "id");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getData(), DraftProposalBasicResponse::getDaoId, daoId, "daoId");
		draftProposalsApiSteps.assertCollectionContainsExactlyInAnyOrder(draftProposalResponse.getData(), DraftProposalBasicResponse::getProposer, account1Id, account2Id);
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getTitle().isEmpty(), "title");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getType().getValue().isEmpty(), "type");
		draftProposalsApiSteps.assertCollectionContainsExactlyInAnyOrder(draftProposalResponse.getData(), DraftProposalBasicResponse::getState, DraftProposalState.OPEN, DraftProposalState.CLOSED);
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getReplies().intValue() >= 0, "replies");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getViews().intValue() >= 0, "views");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getSaves().intValue() >= 0, "saves");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getUpdatedAt().toString().isEmpty(), "updatedAt");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getCreatedAt().toString().isEmpty(), "createdAt");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsRead(), "No boolean value for field:", "isRead");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsSaved(), "No boolean value for field:", "isSaved");
	}


	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft-proposals POST endpoint with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft-proposals POST endpoint with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "automation-01.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForDraftProposalsPostEndpointWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, account1PublicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);
		String title = "Test title. Created " + getLocalDateTime();
		String description = "<p>" + faker.yoda().quote() + "</p>";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title);
		createDraftProposal.setDescription(description);
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft-proposals POST endpoint with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft-proposals POST endpoint with empty 'accountId' parameter")
	void getHttp403ForDraftProposalsPostEndpointWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, account1PublicKey, account1Signature);
		String title = "Test title. Created " + getLocalDateTime();
		String description = "<p>" + faker.yoda().quote() + "</p>";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title);
		createDraftProposal.setDescription(description);
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft-proposals POST endpoint with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft-proposals POST endpoint with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey", "ed25519:5FwoV3MFB94ExfgycBvUQaTbTfgSMPAcfX62bgLBqEPR"})
	void getHttp403ForDraftProposalsPostEndpointWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(account1Id, publicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", account1Id);
		String title = "Test title. Created " + getLocalDateTime();
		String description = "<p>" + faker.yoda().quote() + "</p>";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title);
		createDraftProposal.setDescription(description);
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft-proposals POST endpoint with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft-proposals POST endpoint with empty 'publicKey' parameter")
	void getHttp403ForDraftProposalsPostEndpointWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, EMPTY_STRING, account1Signature);
		String title = "Test title. Created " + getLocalDateTime();
		String description = "<p>" + faker.yoda().quote() + "</p>";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title);
		createDraftProposal.setDescription(description);
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft-proposals POST endpoint with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft-proposals POST endpoint with invalid 'signature' parameter")
	void getHttp403ForDraftProposalsPostEndpointWithInvalidSignatureParam() {
		String invalidSignature = account1Signature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, invalidSignature);
		String title = "Test title. Created " + getLocalDateTime();
		String description = "<p>" + faker.yoda().quote() + "</p>";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title);
		createDraftProposal.setDescription(description);
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft-proposals POST endpoint with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft-proposals POST endpoint with null 'signature' parameter")
	void getHttp403ForDraftProposalsPostEndpointWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, null);
		String title = "Test title. Created " + getLocalDateTime();
		String description = "<p>" + faker.yoda().quote() + "</p>";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title);
		createDraftProposal.setDescription(description);
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft-proposals POST endpoint with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft-proposals POST endpoint with empty 'signature' parameter")
	void getHttp403ForDraftProposalsPostEndpointWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, EMPTY_STRING);
		String title = "Test title. Created " + getLocalDateTime();
		String description = "<p>" + faker.yoda().quote() + "</p>";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title);
		createDraftProposal.setDescription(description);
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

}