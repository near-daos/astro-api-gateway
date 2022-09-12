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
import static java.net.HttpURLConnection.HTTP_FORBIDDEN;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("draftProposalsIdViewApiTests")})
@Epic("Draft Proposals")
@Feature("/draft-proposals/{id}/view API tests")
@DisplayName("draft-proposals/{id}/view API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsIdViewApiTests extends BaseTest {
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
	@Story("Get HTTP 404 for draft proposal view endpoint for non existing draft proposal")
	@DisplayName("Get HTTP 404 for draft proposal view endpoint for non existing draft proposal")
	void getHttp404ForDraftProposalViewEndpointForNonExistingDraftProposal() {
		String nonExistingDraftId = "00ed00c0000e0e000000f00f";
		draftProposalsApiSteps.viewDraftProposal(nonExistingDraftId, authToken).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo("Draft proposal 00ed00c0000e0e000000f00f does not exist"),
				      "error", equalTo("Not Found"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal view endpoint with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft proposal view endpoint with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "automation-01.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForDraftProposalViewEndpointWithNullAndInvalidAccountIdParam(String accountId) {
		String daoId = "63063c43a050fd00089b1f33";
		String authToken = Base64Utils.encodeAuthToken(accountId, account1PublicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		draftProposalsApiSteps.viewDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal view endpoint with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft proposal view endpoint with empty 'accountId' parameter")
	void getHttp403ForDraftProposalViewEndpointWithEmptyAccountIdParam() {
		String daoId = "63063c43a050fd00089b1f33";
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, account1PublicKey, account1Signature);

		draftProposalsApiSteps.viewDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal view endpoint with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft proposal view endpoint with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey", "ed25519:5FwoV3MFB94ExfgycBvUQaTbTfgSMPAcfX62bgLBqEPR"})
	void getHttp403ForDraftProposalViewEndpointWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(account1Id, publicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", account1Id);
		String daoId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.viewDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal view endpoint with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft proposal view endpoint with empty 'publicKey' parameter")
	void getHttp403ForDraftProposalViewEndpointWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, EMPTY_STRING, account1Signature);
		String daoId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.viewDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal view endpoint with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal view endpoint with invalid 'signature' parameter")
	void getHttp403ForDraftProposalViewEndpointWithInvalidSignatureParam() {
		String invalidSignature = account1Signature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, invalidSignature);
		String daoId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.viewDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal view endpoint with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal view endpoint with null 'signature' parameter")
	void getHttp403ForDraftProposalViewEndpointWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, null);
		String daoId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.viewDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal view endpoint with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal view endpoint with empty 'signature' parameter")
	void getHttp403ForDraftProposalViewEndpointWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, EMPTY_STRING);
		String daoId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.viewDraftProposal(daoId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}
}
