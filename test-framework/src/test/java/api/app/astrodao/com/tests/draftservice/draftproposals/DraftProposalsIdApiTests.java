package api.app.astrodao.com.tests.draftservice.draftproposals;

import api.app.astrodao.com.openapi.models.*;
import api.app.astrodao.com.steps.draftservice.DraftProposalsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.util.List;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("draftProposalsIdApiTests")})
@Epic("Draft Proposals")
@Feature("/draft-proposals/{id} API tests")
@DisplayName("/draft-proposals/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsIdApiTests extends BaseTest {
	private final DraftProposalsApiSteps draftProposalsApiSteps;


	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Value("${accounts.account2.accountId}")
	private String account2Id;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("GET draft proposal by valid 'id' and proposer 'accountId' params")
	@DisplayName("GET draft proposal by valid 'id' and proposer 'accountId' params")
	void getDraftProposalByValidIdAndProposerAccountIdParams() {
		String draftId = "62ed05c6520e2e000821f54f";
		String daoId = "test-dao-for-ui-uno.sputnikv2.testnet";

		DraftProposalResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(draftId, account2Id).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getId, draftId, "id");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDaoId, daoId, "daoId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getProposer, account2Id, "proposer");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getTitle, "Test draft proposal. N1", "title");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getType, ProposalType.TRANSFER, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getState, DraftProposalState.OPEN, "state");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getReplies, BigDecimal.ZERO, "replies");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getViews, BigDecimal.ONE, "views");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getSaves, BigDecimal.ONE, "saves");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getUpdatedAt, "updatedAt");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getCreatedAt, "createdAt");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsRead, Boolean.TRUE, "isRead");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsSaved, Boolean.TRUE, "isSaved");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDescription, "<p>Pluto is a planet</p>", "description");

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.TRANSFER, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getProposalVariant(), "ProposeTransfer", "proposalVariant");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getTokenId().isEmpty(), "tokenId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getReceiverId(), account1Id, "receiverId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getAmount(), "1000000000000000000000000", "amount");

		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getId, draftId, "id");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDaoId, daoId, "daoId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getProposer, account2Id, "proposer");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getTitle, "Test draft proposal. N1", "title");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDescription, "<p>Pluto is a planet</p>", "description");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getType, ProposalType.TRANSFER, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.TRANSFER, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getProposalVariant(), "ProposeTransfer", "proposalVariant");
		draftProposalsApiSteps.assertCollectionElementsHasNoValue(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getTokenId().isEmpty(), "tokenId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getReceiverId(), account1Id, "receiverId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getAmount(), "1000000000000000000000000", "amount");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getHistory(), draftProposalHistory -> !draftProposalHistory.getUpdatedAt().toString().isEmpty(), "history/updatedAt");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("GET draft proposal by valid 'id' and 'accountId' who is not a member of current DAO")
	@DisplayName("GET draft proposal by valid 'id' and 'accountId' who is not a member of current DAO")
	void getDraftProposalByValidIdAndAccountIdWhoIsNotAMemberOfCurrentDao() {
		String draftId = "62ed05c6520e2e000821f54f";
		String daoId = "test-dao-for-ui-uno.sputnikv2.testnet";

		DraftProposalResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(draftId, account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getId, draftId, "id");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDaoId, daoId, "daoId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getProposer, account2Id, "proposer");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getTitle, "Test draft proposal. N1", "title");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getType, ProposalType.TRANSFER, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getState, DraftProposalState.OPEN, "state");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getReplies, BigDecimal.ZERO, "replies");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getViews, BigDecimal.ONE, "views");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getSaves, BigDecimal.ONE, "saves");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getUpdatedAt, "updatedAt");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getCreatedAt, "createdAt");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsRead, Boolean.FALSE, "isRead");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsSaved, Boolean.FALSE, "isSaved");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDescription, "<p>Pluto is a planet</p>", "description");

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.TRANSFER, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getProposalVariant(), "ProposeTransfer", "proposalVariant");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getTokenId().isEmpty(), "tokenId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getReceiverId(), account1Id, "receiverId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getAmount(), "1000000000000000000000000", "amount");

		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getId, draftId, "id");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDaoId, daoId, "daoId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getProposer, account2Id, "proposer");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getTitle, "Test draft proposal. N1", "title");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDescription, "<p>Pluto is a planet</p>", "description");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getType, ProposalType.TRANSFER, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.TRANSFER, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getProposalVariant(), "ProposeTransfer", "proposalVariant");
		draftProposalsApiSteps.assertCollectionElementsHasNoValue(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getTokenId().isEmpty(), "tokenId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getReceiverId(), account1Id, "receiverId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getAmount(), "1000000000000000000000000", "amount");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getHistory(), draftProposalHistory -> !draftProposalHistory.getUpdatedAt().toString().isEmpty(), "history/updatedAt");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("GET draft proposal by valid 'id' and empty 'accountId' params")
	@DisplayName("GET draft proposal by valid 'id' and empty 'accountId' params")
	void getDraftProposalByValidIdAndEmptyAccountIdParams() {
		String draftId = "62ed05c6520e2e000821f54f";
		String daoId = "test-dao-for-ui-uno.sputnikv2.testnet";

		DraftProposalResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(draftId, EMPTY_STRING).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getId, draftId, "id");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDaoId, daoId, "daoId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getProposer, account2Id, "proposer");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getTitle, "Test draft proposal. N1", "title");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getType, ProposalType.TRANSFER, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getState, DraftProposalState.OPEN, "state");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getReplies, BigDecimal.ZERO, "replies");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getViews, BigDecimal.ONE, "views");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getSaves, BigDecimal.ONE, "saves");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getUpdatedAt, "updatedAt");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getCreatedAt, "createdAt");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsRead, Boolean.FALSE, "isRead");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsSaved, Boolean.FALSE, "isSaved");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDescription, "<p>Pluto is a planet</p>", "description");

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.TRANSFER, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getProposalVariant(), "ProposeTransfer", "proposalVariant");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getTokenId().isEmpty(), "tokenId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getReceiverId(), account1Id, "receiverId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getAmount(), "1000000000000000000000000", "amount");

		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getId, draftId, "id");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDaoId, daoId, "daoId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getProposer, account2Id, "proposer");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getTitle, "Test draft proposal. N1", "title");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDescription, "<p>Pluto is a planet</p>", "description");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getType, ProposalType.TRANSFER, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.TRANSFER, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getProposalVariant(), "ProposeTransfer", "proposalVariant");
		draftProposalsApiSteps.assertCollectionElementsHasNoValue(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getTokenId().isEmpty(), "tokenId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getReceiverId(), account1Id, "receiverId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getAmount(), "1000000000000000000000000", "amount");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getHistory(), draftProposalHistory -> !draftProposalHistory.getUpdatedAt().toString().isEmpty(), "history/updatedAt");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for draft proposal endpoint with not valid draft id")
	@DisplayName("Get HTTP 400 for draft proposal endpoint with not valid draft id")
	@CsvSource({"invalidId", "2212332141", "-1", "0", "62ed05c6520e2e999999k00k",
			"*", "null", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
	void getHttp400ForDraftProposalEndpointWithNotValidDraftId(String draftId) {
		draftProposalsApiSteps.getDraftProposalById(draftId, EMPTY_STRING).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(List.of("id must be a mongodb id")),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 404 for draft proposal endpoint with non-existing draft id")
	@DisplayName("Get HTTP 404 for draft proposal endpoint with non-existing draft id")
	void getHttp404ForDraftProposalEndpointWithNonExistingDraftId() {
		String nonExistingDraftId = "00ed00c0000e0e000000f00f";
		draftProposalsApiSteps.getDraftProposalById(nonExistingDraftId, EMPTY_STRING).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo("Draft proposal 00ed00c0000e0e000000f00f does not exist"),
				      "error", equalTo("Not Found"));
	}
}