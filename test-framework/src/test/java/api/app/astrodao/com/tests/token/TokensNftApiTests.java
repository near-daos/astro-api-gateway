package api.app.astrodao.com.tests.token;

import api.app.astrodao.com.core.dto.api.tokens.NFTTokensList;
import api.app.astrodao.com.openapi.models.NFTTokenResponse;
import api.app.astrodao.com.steps.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tags({@Tag("all"), @Tag("tokensNftApiTests")})
@Epic("Token")
@Feature("/tokens/nfts API tests")
@DisplayName("/tokens/nfts API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TokensNftApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of tokens with query param: [sort, limit, offset]")
	@DisplayName("Get list of tokens with query param: [sort, limit, offset]")
	void getNFTsWithSortLimitOffsetParams() {
		Map<String, Object> query = Map.of(
				"sort","createdAt,DESC",
				"limit", 10,
				"offset", 0
		);
		int limit = 10;
		int page = 1;
		ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		NFTTokenResponse tokenResponse = tokenApiSteps.getResponseDto(response, NFTTokenResponse.class);

		tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), limit, "total");
		tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), page, "page");
		tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getCount().intValue(), limit, "limit");
		tokenApiSteps.assertCollectionHasCorrectSize(tokenResponse.getData(), limit);
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getOwnerId().isBlank(), "ownerId");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContractId().isBlank(), "contractId");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getId().isBlank(), "contract/id");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getSpec().isBlank(), "contract/spec");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getIcon().isBlank(), "contract/icon");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of NFTs with query param: [sort, page]")
	@DisplayName("Get list of NFTs with query param: [sort, page]")
	void getListOfNFTsWithSortPageParams() {
		int page = 1;
		Map<String, Object> query = Map.of(
				"sort","createdAt,DESC",
				"page", page
		);
		ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		NFTTokenResponse tokenResponse = tokenApiSteps.getResponseDto(response, NFTTokenResponse.class);

		tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), page, "page");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
		tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), 20, "total");
		tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), 20, "limit");
		tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getOwnerId().isBlank(), "ownerId");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContractId().isBlank(), "contractId");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getId().isBlank(), "contract/id");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getSpec().isBlank(), "contract/spec");
	}

	@Test
	@Disabled("Getting BAD_REQUEST on request, looks like a bug")
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of NFTs with query param: [sort, fields]")
	@DisplayName("Get list of NFTs with query param: [sort, fields]")
	void getListOfNFTsWithSortFieldsParams() {
		Map<String, Object> query = Map.of(
//                "sort","id,DESC",
				"fields", "id,ownerId"
		);
		ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		NFTTokensList tokensList = tokenApiSteps.getResponseDto(response, NFTTokensList.class);

		tokenApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(tokensList, 20);
		tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getId().isBlank(), "id");
		tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getTokenId().isBlank(), "ownerId");
		//TODO: add verification that other fields are null
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of tokens with query param: [sort, s]")
	@DisplayName("Get list of tokens with query param: [sort, s]")
	void getListOfNFTsWithSortAndSParams() {
		String contractId = "space7.mintspace2.testnet";
		Map<String, Object> query = Map.of(
				"sort","createdAt,DESC",
				"s", String.format("{\"contractId\": \"%s\"}", contractId)
		);
		ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		NFTTokenResponse tokenResponse = tokenApiSteps.getResponseDto(response, NFTTokenResponse.class);

		tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), 1, "page");
		tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getTotal().intValue(), 1, "total");
		tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getTotal().intValue(), 1, "limit");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getOwnerId().isBlank(), "ownerId");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContractId().isBlank(), "contractId");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getId().isBlank(), "contract/id");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getSpec().isBlank(), "contract/spec");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should not be able to get NFTs for request with invalid params")
	@DisplayName("User should not be able to get NFTs for request with invalid params")
	void userShouldNotBeAbleToGetNFTsForRequestWithInvalidParams() {
		Map<String, Object> query = Map.of(
				"limit","-1"
		);
		String expectedResponse = "LIMIT must not be negative";

		ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
		tokenApiSteps.assertStringContainsValue(response.getBody(), expectedResponse);
	}
}
