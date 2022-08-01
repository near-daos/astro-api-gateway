package api.app.astrodao.com.tests.apiservice.token;

import api.app.astrodao.com.openapi.models.NFTToken;
import api.app.astrodao.com.openapi.models.NFTTokenResponse;
import api.app.astrodao.com.steps.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("tokensApiTests"), @Tag("tokensNftApiTests")})
@Epic("Token")
@Feature("/tokens/nfts API tests")
@DisplayName("/tokens/nfts API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TokensNftApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of NFTs with query param: [sort, limit, offset]")
	@DisplayName("Get list of NFTs with query param: [sort, limit, offset]")
	void getNFTsWithSortLimitOffsetParams() {
		Map<String, Object> query = Map.of(
				"sort","createdAt,DESC",
				"limit", 10,
				"offset", 0
		);
		int limit = 10;
		int page = 1;

		NFTTokenResponse tokenResponse = tokenApiSteps.getNFTs(query).then()
				.statusCode(HTTP_OK)
				.extract().as(NFTTokenResponse.class);

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

		NFTTokenResponse tokenResponse = tokenApiSteps.getNFTs(query).then()
				.statusCode(HTTP_OK)
				.extract().as(NFTTokenResponse.class);

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
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of NFTs with query param: [sort, fields]")
	@DisplayName("Get list of NFTs with query param: [sort, fields]")
	void getListOfNFTsWithSortFieldsParams() {
		int page = 1;
		Map<String, Object> query = Map.of(
				"sort","id,DESC",
				"fields", "id,ownerId"
		);

		NFTTokenResponse tokenResponse = tokenApiSteps.getNFTs(query).then()
				.statusCode(HTTP_OK)
				.extract().as(NFTTokenResponse.class);

		tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), page, "page");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
		tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), 20, "total");
		tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), 20, "limit");
		tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
		tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getOwnerId().isBlank(), "ownerId");
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

		NFTTokenResponse tokenResponse = tokenApiSteps.getNFTs(query).then()
				.statusCode(HTTP_OK)
				.extract().as(NFTTokenResponse.class);

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
	@Severity(SeverityLevel.NORMAL)
	@Story("User should not be able to get NFTs for request with invalid params")
	@DisplayName("User should not be able to get NFTs for request with invalid params")
	void userShouldNotBeAbleToGetNFTsForRequestWithInvalidParams() {
		Map<String, Object> query = Map.of(
				"limit","-1"
		);
		String expectedResponse = "LIMIT must not be negative";

		Response response = tokenApiSteps.getNFTs(query);
		tokenApiSteps.assertResponseStatusCode(response, HTTP_BAD_REQUEST);
		tokenApiSteps.assertStringContainsValue(response.body().asString(), expectedResponse);
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of NFTs with query params: [filter, or]")
	@DisplayName("Get list of NFTs with query params: [filter, or]")
	void getListOfNftsWithQueryParamsFilterOr() {
		int count = 2;
		int total = 2;
		int page = 1;
		int pageCount = 1;
		String nftId1 = "mintickt.mintspace2.testnet-225";
		String nftId2 = "mintickt.mintspace2.testnet-227";

		Map<String, Object> query = Map.of(
				"filter", "id||$eq||" + nftId1,
				"or", "id||$eq||" + nftId2
		);

		NFTTokenResponse tokenResponse = tokenApiSteps.getNFTs(query).then()
				.statusCode(HTTP_OK)
				.extract().as(NFTTokenResponse.class);

		tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getCount().intValue(), count, "count");
		tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getTotal().intValue(), total, "total");
		tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), page, "page");
		tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getPageCount().intValue(), pageCount, "pageCount");
		tokenApiSteps.assertCollectionContainsExactlyInAnyOrder(tokenResponse.getData(), NFTToken::getId, nftId1, nftId2);

	}
}
