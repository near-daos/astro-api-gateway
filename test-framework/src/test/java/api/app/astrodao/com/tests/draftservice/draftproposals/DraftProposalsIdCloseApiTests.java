package api.app.astrodao.com.tests.draftservice.draftproposals;

import api.app.astrodao.com.core.utils.Base64Utils;
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
import org.junit.jupiter.params.provider.NullSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.*;
import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("draftProposalsIdCloseApiTests")})
@Epic("Draft Proposals")
@Feature("/draft-proposals/{id}/close API tests")
@DisplayName("draft-proposals/{id}/close API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsIdCloseApiTests extends BaseTest {
	private final DraftProposalsApiSteps draftProposalsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Value("${accounts.account1.token}")
	private String authToken;

	@Value("${accounts.account1.publicKey}")
	private String account1PublicKey;

	@Value("${accounts.account1.signature}")
	private String account1Signature;


	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for draft proposal close endpoint for already closed draft proposal")
	@DisplayName("Get HTTP 400 for draft proposal close endpoint for already closed draft proposal")
	void getHttp400ForDraftProposalCloseEndpointForAlreadyClosedDraftProposal() {
		String closedDraftId = "6304a2a116e4390008f6b855";
		draftProposalsApiSteps.closeDraftProposal(closedDraftId, authToken).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Draft proposal is closed"),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 404 for draft proposal close endpoint for non existing draft proposal")
	@DisplayName("Get HTTP 404 for draft proposal close endpoint for non existing draft proposal")
	void getHttp404ForDraftProposalCloseEndpointForNonExistingDraftProposal() {
		String nonExistingDraftId = "00ed00c0000e0e000000f00f";
		draftProposalsApiSteps.closeDraftProposal(nonExistingDraftId, authToken).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo("Draft proposal 00ed00c0000e0e000000f00f does not exist"),
				      "error", equalTo("Not Found"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal close endpoint with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft proposal close endpoint with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "automation-01.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForDraftProposalCloseEndpointWithNullAndInvalidAccountIdParam(String accountId) {
		String daoId = "63063c43a050fd00089b1f33";
		String authToken = Base64Utils.encodeAuthToken(accountId, account1PublicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		draftProposalsApiSteps.closeDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal close endpoint with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft proposal close endpoint with empty 'accountId' parameter")
	void getHttp403ForDraftProposalCloseEndpointWithEmptyAccountIdParam() {
		String daoId = "63063c43a050fd00089b1f33";
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, account1PublicKey, account1Signature);

		draftProposalsApiSteps.closeDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal close endpoint with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft proposal close endpoint with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey", "ed25519:5FwoV3MFB94ExfgycBvUQaTbTfgSMPAcfX62bgLBqEPR"})
	void getHttp403ForDraftProposalCloseEndpointWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(account1Id, publicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", account1Id);
		String daoId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.closeDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}


}