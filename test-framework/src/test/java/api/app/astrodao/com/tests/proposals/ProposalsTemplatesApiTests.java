package api.app.astrodao.com.tests.proposals;

import api.app.astrodao.com.openapi.models.SharedProposalTemplateResponseDto;
import api.app.astrodao.com.openapi.models.SharedProposalTemplatesResponse;
import api.app.astrodao.com.steps.ProposalsApiSteps;
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

@Tags({@Tag("all"), @Tag("proposalsTemplatesApiTests")})
@Epic("Proposals")
@Feature("/proposals/templates API tests")
@DisplayName("/proposals/templates API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ProposalsTemplatesApiTests extends BaseTest {
	private final ProposalsApiSteps proposalsApiSteps;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of proposal templates with query param: [sort, limit, offset]")
	@DisplayName("Get list of proposal templates with query param: [sort, limit, offset]")
	void getListOfProposalTemplatesWithSortLimitOffsetParams() {
		Map<String, Object> query = Map.of(
				"sort","createdAt,DESC",
				"limit", 3,
				"offset", 1
		);

		SharedProposalTemplatesResponse templatesResponse = proposalsApiSteps.getListOfProposalTemplates(query).then()
				.statusCode(HTTP_OK)
				.extract().as(SharedProposalTemplatesResponse.class);

		proposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(templatesResponse, r -> r.getCount().intValue(), 2, "count");
		proposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(templatesResponse, r -> r.getTotal().intValue(), 3, "total");
		proposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(templatesResponse, r -> r.getPage().intValue(), 1, "page");
		proposalsApiSteps.assertDtoValueGreaterThanOrEqualTo(templatesResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
		proposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(templatesResponse.getData(), proposalTemplate -> !proposalTemplate.getIsArchived(), "No boolean value for field:", "data/isArchived");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getCreatedAt().toString().isEmpty(), "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getUpdatedAt().toString().isEmpty(), "data/updatedAt");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getId().isEmpty(), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getCreatedBy().isEmpty(), "data/createdBy");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getName().isEmpty(), "data/name");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> r.getDaoCount().intValue() > 0, "data/daoCount");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getConfig().getMethodName().isEmpty(), "data/config/methodName");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getConfig().getDeposit().isEmpty(), "data/config/deposit");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getConfig().getSmartContractAddress().isEmpty(), "data/config/smartContractAddress");
		proposalsApiSteps.assertCollectionElementsHasValue(templatesResponse.getData(), r -> !r.getConfig().getActionsGas().isEmpty(), "data/config/actionsGas");

		List<OffsetDateTime> createdAtList = templatesResponse.getData().stream().map(SharedProposalTemplateResponseDto::getCreatedAt).collect(Collectors.toList());
		proposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                          "Proposals templates should be sorted by createdAt in DESC order");
	}


}
