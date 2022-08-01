package api.app.astrodao.com.tests.apiservice.token;

import api.app.astrodao.com.core.dto.api.tokens.AssetsNftEventList;
import api.app.astrodao.com.steps.apiservice.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("tokensApiTests"), @Tag("tokensNftsEventsApiTests")})
@Epic("Token")
@Feature("/tokens/nfts/{id}/events API tests")
@DisplayName("/tokens/nfts/{id}/events API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TokensNftsEventsApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting events for valid NFT ID")
	@DisplayName("Getting events for valid NFT ID")
	void getEventsForValidNftID() {
		String nftID = "mintickt.mintspace2.testnet-218";

		AssetsNftEventList eventsResponse = tokenApiSteps.getEventsForNFT(nftID).then()
				.statusCode(HTTP_OK)
				.extract().as(AssetsNftEventList.class);

		tokenApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(eventsResponse, 1);
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getEmittedForReceiptId().isEmpty(), "emittedForReceiptId");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getEmittedByContractAccountId().isEmpty(), "emittedByContractAccountId");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getTokenId().isEmpty(), "tokenId");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getEventKind().isEmpty(), "eventKind");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getTokenNewOwnerAccountId().isEmpty(), "tokenNewOwnerAccountId");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getEventMemo().isEmpty(), "eventMemo");
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Getting events for invalid NFT ID")
	@DisplayName("Getting events for invalid NFT ID")
	void getEventsForInvalidNftID() {
		String nftID = "space7.mintspace2.testnet-123";
		String errorMsg = String.format("NFT with id %s not found", nftID);

		Response response = tokenApiSteps.getEventsForNFT(nftID);
		tokenApiSteps.assertResponseStatusCode(response, HTTP_NOT_FOUND);
		tokenApiSteps.assertStringContainsValue(response.body().asString(), errorMsg);
	}
}
