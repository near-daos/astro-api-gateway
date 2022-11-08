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

import java.util.List;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasToString;

@Tags({@Tag("all"), @Tag("draftProposalsDaoIdIdCloseApiTests")})
@Epic("Draft Proposals")
@Feature("/draft-proposals/{daoId}/{id}/close API tests")
@DisplayName("/draft-proposals/{daoId}/{id}/close API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsDaoIdIdCloseApiTests extends BaseTest {
	private final DraftProposalsApiSteps draftProposalsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Value("${accounts.account1.token}")
	private String authToken;

	@Value("${accounts.account1.publicKey}")
	private String account1PublicKey;

	@Value("${accounts.account1.signature}")
	private String account1Signature;

	@Value("${test.dao1}")
	private String testDao;


	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("User should be able to close an already closed draft proposal")
	@DisplayName("User should be able to close an already closed draft proposal")
	void closeAlreadyClosedDraftProposal() {
		String closedDraftId = "6304a2a116e4390008f6b855";
		draftProposalsApiSteps.closeDraftProposal(testDao, closedDraftId, authToken).then()
				.statusCode(HTTP_CREATED)
				.body("", hasToString("true"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 404 for draft proposal close endpoint for non existing draft proposal")
	@DisplayName("Get HTTP 404 for draft proposal close endpoint for non existing draft proposal")
	void getHttp404ForDraftProposalCloseEndpointForNonExistingDraftProposal() {
		String nonExistingDraftId = "00ed00c0000e0e000000f00f";
		draftProposalsApiSteps.closeDraftProposal(testDao, nonExistingDraftId, authToken).then()
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
		String draftId = "63063c43a050fd00089b1f33";
		String authToken = Base64Utils.encodeAuthToken(accountId, account1PublicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		draftProposalsApiSteps.closeDraftProposal(testDao, draftId, authToken).then()
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
		String draftId = "63063c43a050fd00089b1f33";
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, account1PublicKey, account1Signature);

		draftProposalsApiSteps.closeDraftProposal(testDao, draftId, authToken).then()
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
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.closeDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal close endpoint with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft proposal close endpoint with empty 'publicKey' parameter")
	void getHttp403ForDraftProposalCloseEndpointWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, EMPTY_STRING, account1Signature);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.closeDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal close endpoint with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal close endpoint with invalid 'signature' parameter")
	void getHttp403ForDraftProposalCloseEndpointWithInvalidSignatureParam() {
		String invalidSignature = account1Signature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, invalidSignature);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.closeDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal close endpoint with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal close endpoint with null 'signature' parameter")
	void getHttp403ForDraftProposalCloseEndpointWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, null);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.closeDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal close endpoint with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal close endpoint with empty 'signature' parameter")
	void getHttp403ForDraftProposalCloseEndpointWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, EMPTY_STRING);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.closeDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for draft proposal close endpoint with empty body")
	@DisplayName("Get HTTP 400 for draft proposal close endpoint with empty body")
	void getHttp400ForDraftProposalCloseEndpointWithEmptyBody() {
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.closeDraftProposalWithEmptyBody(testDao, draftId, authToken).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(List.of("proposalId should not be empty")),
				      "error", equalTo("Bad Request"));
	}
}