package api.app.astrodao.com.tests.token;

import api.app.astrodao.com.core.dto.api.tokens.AssetsNftEventList;
import api.app.astrodao.com.steps.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Tags({@Tag("all"), @Tag("tokensNftsEventsApiTests")})
@Epic("Token")
@Feature("/tokens/nfts/{id}/events API tests")
@DisplayName("/tokens/nfts/{id}/events API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TokensNftsEventsApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting events for valid NFT ID ")
	@DisplayName("Getting events for valid NFT ID ")
	void getEventsForValidNftID() {
		String nftID = "mintickt.mintspace2.testnet-218";

		ResponseEntity<String> response = tokenApiSteps.getEventsForNFT(nftID);
		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		AssetsNftEventList eventsResponse = tokenApiSteps.getResponseDto(response, AssetsNftEventList.class);

		tokenApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(eventsResponse, 1);
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getEmittedForReceiptId().isEmpty(), "emittedForReceiptId");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getEmittedByContractAccountId().isEmpty(), "emittedByContractAccountId");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getTokenId().isEmpty(), "tokenId");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getEventKind().isEmpty(), "eventKind");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getTokenNewOwnerAccountId().isEmpty(), "tokenNewOwnerAccountId");
		tokenApiSteps.assertCollectionElementsHasValue(eventsResponse, r -> !r.getEventMemo().isEmpty(), "eventMemo");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting events for invalid NFT ID ")
	@DisplayName("Getting events for invalid NFT ID ")
	void getEventsForInvalidNftID() {
		String nftID = "space7.mintspace2.testnet-123";
		String errorMsg = String.format("NFT with id %s not found", nftID);

		ResponseEntity<String> response = tokenApiSteps.getEventsForNFT(nftID);
		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.NOT_FOUND);
		tokenApiSteps.assertStringContainsValue(response.getBody(), errorMsg);
	}
}
