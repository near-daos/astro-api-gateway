package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.dao.DAODto;
import api.app.astrodao.com.core.dto.api.proposals.ProposalDto;
import api.app.astrodao.com.core.dto.cli.AddProposalResponse;
import api.app.astrodao.com.core.dto.cli.CLIResponse;
import api.app.astrodao.com.core.dto.cli.dao.*;
import api.app.astrodao.com.core.dto.cli.proposals.bounty.*;
import api.app.astrodao.com.core.dto.cli.proposals.config.ChangeConfigDto;
import api.app.astrodao.com.core.dto.cli.proposals.policy.ChangePolicyDto;
import api.app.astrodao.com.core.dto.cli.proposals.poll.PollProposal;
import api.app.astrodao.com.core.dto.cli.proposals.poll.PollProposalDto;
import api.app.astrodao.com.core.dto.cli.proposals.transfer.Transfer;
import api.app.astrodao.com.core.dto.cli.proposals.transfer.TransferProposalDto;
import api.app.astrodao.com.core.dto.cli.vote.VoteDto;
import api.app.astrodao.com.steps.BountiesApiSteps;
import api.app.astrodao.com.steps.DaoApiSteps;
import api.app.astrodao.com.steps.NearCLISteps;
import api.app.astrodao.com.steps.ProposalsApiSteps;
import com.github.javafaker.Faker;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static api.app.astrodao.com.core.utils.WaitUtils.getEpochMillis;
import static api.app.astrodao.com.core.utils.WaitUtils.getLocalDateTime;
import static org.apache.commons.lang3.StringUtils.EMPTY;

@Tags({@Tag("all"), @Tag("aggregationWithoutCallback")})
@Feature("AGGREGATION WITHOUT CALLBACK TESTS")
@DisplayName("AGGREGATION WITHOUT CALLBACK TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AggregationWithoutCallbackTests extends BaseTest {
    private final Faker faker;
    private final NearCLISteps nearCLISteps;
    private final ProposalsApiSteps proposalsApiSteps;
    private final BountiesApiSteps bountiesApiSteps;
    private final DaoApiSteps daoApiSteps;

    @Value("${test.accountId}")
    private String testAccountId;

    @Value("${test.dao}")
    private String testDao;

    @Value("${test.aggregation.timeout}")
    private int aggregationTimeout;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created DAO via Sputnik v2 API")
    @DisplayName("User should be able to get newly created DAO via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedDaoViaSputnikV2Api() {
        float deposit = 5F;
        long gasValue = 100000000000000L;
        String daoDisplayName = String.format("Test DAO %s", getEpochMillis());
        String daoName = daoDisplayName.toLowerCase().replaceAll("\\s", "-");
        String daoId = String.format("%s.sputnikv2.testnet", daoName);
        String daoPurpose = faker.lorem().characters(20, 30);
        String bond = "100000000000000000000000";
        String period = "604800000000000";
        String gracePeriod = "86400000000000";

        Role<KindWithGroup> role = Role.<KindWithGroup>of()
                .setName("Council")
                .setKind(KindWithGroup.of(List.of(testAccountId)))
                .setPermissions(List.of("*:Finalize", "*:AddProposal", "*:VoteApprove", "*:VoteReject", "*:VoteRemove"))
                .setVotePolicy(VotePolicy.of());

        DefaultVotePolicy defaultVotePolicy = DefaultVotePolicy.of()
                .setWeightKind("RoleWeight")
                .setQuorum("0")
                .setThreshold(List.of(1, 2));

        Policy policy = Policy.of()
                .setRoles(List.of(role))
                .setDefaultVotePolicy(defaultVotePolicy)
                .setProposalBond(bond)
                .setProposalPeriod(period)
                .setBountyBond(bond)
                .setBountyForgivenessPeriod(period);

        Metadata metadata = Metadata.of().setFlag("c1vdoupozsy28WZc2tm5e")
                .setDisplayName(daoDisplayName).setLinks(List.of());
        Config config = Config.of(daoName, daoPurpose, metadata);

        DAOArgs daoArgs = DAOArgs.of()
                .setPurpose(daoPurpose)
                .setBond(bond)
                .setVotePeriod(period)
                .setGracePeriod(gracePeriod)
                .setPolicy(policy)
                .setConfig(config);

        NewDAODto newDaoDto = NewDAODto.of(daoName, daoArgs);
        CLIResponse cliResponse = nearCLISteps.createNewDao(newDaoDto, testAccountId, gasValue, deposit);

        ResponseEntity<String> response = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> daoApiSteps.getDAOByID(daoId)
        );
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DAODto daoDto = daoApiSteps.getResponseDto(response, DAODto.class);
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getIsArchived, Boolean.FALSE, "isArchived");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getId, daoId, "id");
        //TODO: Ask a question or raise a bug, sometimes TransactionHash is not available after DAO creation
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getTransactionHash, cliResponse.getTransactionHash(), "transactionHash");
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getUpdateTransactionHash, cliResponse.getTransactionHash(), "updateTransactionHash");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getName(), daoName, "config/name");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getPurpose(), daoPurpose, "config/purpose");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getMetadata(), config.getMetadata(), "config/metadata");
        //TODO: Add verification for amount
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getAmount, "5000071399234288200000000", "amount");
        //TODO: Ask a question or raise a bug, sometimes createdBy is not available after DAO creation
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getCreatedBy, testAccountId, "createdBy");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getTotalSupply, "0", "totalSupply");
        daoApiSteps.assertDtoValue(daoDto, DAODto::getNumberOfMembers, 1, "numberOfMembers");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getProposalBond(), bond, "policy/proposalBond");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getBountyBond(), bond, "policy/bountyBond");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getBountyForgivenessPeriod(), period, "policy/bountyForgivenessPeriod");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getProposalPeriod(), period, "policy/proposalPeriod");
        daoApiSteps.assertCollectionHasCorrectSize(daoDto.getPolicy().getRoles(), 1);
        daoApiSteps.assertCollectionsAreEqual(daoDto.getPolicy().getRoles().get(0).getPermissions(), role.getPermissions());
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getRoles().get(0).getName(), role.getName(), "policy/roles[1]/name");
    }

    @Test
    @Tag("debug")
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created poll proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created poll proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedPollProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        PollProposal pollProposal = PollProposal.of(String.format("Poll created with NEAR CLI %s", getEpochMillis()), "Vote");
        PollProposalDto pollProposalDto = PollProposalDto.of(pollProposal);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, pollProposalDto, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, pollProposal.getDescription(), "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), pollProposal.getKind(), "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created transfer proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created transfer proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedTransferProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String receiverId = "roman-account.testnet";
        String amount = "2500000000000000000000000"; //2.5 NEAR
        String description = String.format("Donation via NEAR CLI %s", getEpochMillis());

        Transfer transfer = Transfer.of().setReceiverId(receiverId).setAmount(amount).setTokenId(EMPTY);
        TransferProposalDto transferProposal = TransferProposalDto.of(description, transfer);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, transferProposal, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "Transfer", "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created add bounty proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created add bounty proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedAddBountyProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = "Google for YouTube trends in 2021 Q4" + getEpochMillis();
        String amount = "1500000000000000000000000"; //1.5 NEAR
        Bounty bounty = Bounty.of()
                .setDescription(description)
                .setToken(EMPTY)
                .setAmount(amount)
                .setMaxDeadline("259200000000000")
                .setTimes(3);
        Proposal proposal = Proposal.of()
                .setDescription(description)
                .setKind(Kind.of(AddBounty.of(bounty)));
        BountyProposalDto bountyProposal = BountyProposalDto.of(proposal);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, bountyProposal, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "AddBounty", "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change config (new name update) proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change config proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedChangeConfigNameUpdateProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing name for %s %s", daoName, getEpochMillis());

        Config config = nearCLISteps.getDaoConfig(daoName);
        Metadata decodedMetadata = Metadata.decodeMetadata(config.getMetadata());

        String newDisplayName = String.format("Updated name test DAO %s", getEpochMillis());
        Metadata updatedMetadata = Metadata.of()
                .setDisplayName(newDisplayName)
                .setFlag(decodedMetadata.getFlag())
                .setLinks(decodedMetadata.getLinks());
        Config newConfig = Config.of(config.getName(), config.getPurpose(), updatedMetadata);
        ChangeConfigDto changeConfig = ChangeConfigDto.of(description, newConfig);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, changeConfig, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangeConfig", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangeConfig", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getName(), newConfig.getName(), "kind/config/name");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getPurpose(), newConfig.getPurpose(), "kind/config/purpose");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getMetadata(), newConfig.getMetadata(), "kind/config/metadata");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change config (new purpose update) proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change config (new purpose update) proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedChangeConfigPurposeUpdateProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing purpose for %s %s", daoName, getEpochMillis());

        Config config = nearCLISteps.getDaoConfig(daoName);

        String newPurpose = String.format("New purpose %s", getEpochMillis());
        Config newConfig = Config.of(config.getName(), newPurpose, config.getMetadata());
        ChangeConfigDto changeConfig = ChangeConfigDto.of(description, newConfig);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, changeConfig, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangeConfig", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangeConfig", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getName(), newConfig.getName(), "kind/config/name");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getPurpose(), newConfig.getPurpose(), "kind/config/purpose");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getMetadata(), newConfig.getMetadata(), "kind/config/metadata");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change config (links update) proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change config (links update) proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedChangeConfigLinksUpdateProposalViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing name for %s %s", daoName, getEpochMillis());

        Config config = nearCLISteps.getDaoConfig(daoName);
        Metadata decodedMetadata = Metadata.decodeMetadata(config.getMetadata());

        Metadata updatedMetadata = Metadata.of()
                .setDisplayName(decodedMetadata.getDisplayName())
                .setFlag(decodedMetadata.getFlag())
                .setLinks(List.of(faker.internet().url(), faker.internet().url()));
        Config newConfig = Config.of(config.getName(), config.getPurpose(), updatedMetadata);
        ChangeConfigDto changeConfig = ChangeConfigDto.of(description, newConfig);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, changeConfig, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangeConfig", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangeConfig", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getName(), newConfig.getName(), "kind/config/name");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getPurpose(), newConfig.getPurpose(), "kind/config/purpose");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getMetadata(), newConfig.getMetadata(), "kind/config/metadata");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change policy proposal (proposal bound update) via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change policy proposal (proposal bound update) via Sputnik v2 API")
    void getNewlyCreatedChangePolicyProposalProposalBoundUpdateViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing policy (new proposal bond) for %s %s", daoName, getEpochMillis());

        Policy daoPolicy = nearCLISteps.getDaoPolicy(daoName);

        Policy newPolicy = Policy.copy(daoPolicy)
                .setProposalBond("150000000000000000000000"); //0.15 NEAR

        ChangePolicyDto changePolicy = ChangePolicyDto.of(description, newPolicy);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, changePolicy, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangePolicy", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangePolicy", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalBond(), newPolicy.getProposalBond(), "kind/policy/proposal_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalPeriod(), newPolicy.getProposalPeriod(), "kind/policy/proposal_period");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyBond(), newPolicy.getBountyBond(), "kind/policy/bounty_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyForgivenessPeriod(), newPolicy.getBountyForgivenessPeriod(), "kind/policy/bounty_forgiveness_period");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change policy proposal (proposal period update) via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change policy proposal (proposal period update) via Sputnik v2 API")
    void getNewlyCreatedChangePolicyProposalProposalBoundPeriodUpdateViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing policy (new proposal period) for %s %s", daoName, getEpochMillis());

        Policy daoPolicy = nearCLISteps.getDaoPolicy(daoName);

        Policy newPolicy = Policy.copy(daoPolicy)
                .setProposalPeriod("259200000000000"); //3 days

        ChangePolicyDto changePolicy = ChangePolicyDto.of(description, newPolicy);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, changePolicy, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangePolicy", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangePolicy", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalBond(), newPolicy.getProposalBond(), "kind/policy/proposal_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalPeriod(), newPolicy.getProposalPeriod(), "kind/policy/proposal_period");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyBond(), newPolicy.getBountyBond(), "kind/policy/bounty_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyForgivenessPeriod(), newPolicy.getBountyForgivenessPeriod(), "kind/policy/bounty_forgiveness_period");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change policy proposal (bounty bond update) via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change policy proposal (bounty bond update) via Sputnik v2 API")
    void getNewlyCreatedChangePolicyProposalBountyBondUpdateViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing policy (new bounty bond) for %s %s", daoName, getEpochMillis());

        Policy daoPolicy = nearCLISteps.getDaoPolicy(daoName);

        Policy newPolicy = Policy.copy(daoPolicy)
                .setBountyBond("150000000000000000000000"); //0.15 NEAR

        ChangePolicyDto changePolicy = ChangePolicyDto.of(description, newPolicy);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, changePolicy, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangePolicy", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangePolicy", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalBond(), newPolicy.getProposalBond(), "kind/policy/proposal_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalPeriod(), newPolicy.getProposalPeriod(), "kind/policy/proposal_period");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyBond(), newPolicy.getBountyBond(), "kind/policy/bounty_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyForgivenessPeriod(), newPolicy.getBountyForgivenessPeriod(), "kind/policy/bounty_forgiveness_period");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change policy proposal (bounty forgiveness period update) via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change policy proposal (bounty forgiveness period update) via Sputnik v2 API")
    void getNewlyCreatedChangePolicyProposalProposalBountyForgivenessPeriodUpdateViaSputnikV2Api() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing policy (new bounty forgiveness period update) for %s %s", daoName, getEpochMillis());

        Policy daoPolicy = nearCLISteps.getDaoPolicy(daoName);

        Policy newPolicy = Policy.copy(daoPolicy)
                .setBountyForgivenessPeriod("259200000000000"); //3 days

        ChangePolicyDto changePolicy = ChangePolicyDto.of(description, newPolicy);

        AddProposalResponse output = nearCLISteps.addProposal(daoName, changePolicy, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", daoName, output.getId());

        ResponseEntity<String> responseEntity = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(responseEntity, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(responseEntity, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, daoName, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangePolicy", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, "InProgress", "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangePolicy", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalBond(), newPolicy.getProposalBond(), "kind/policy/proposal_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalPeriod(), newPolicy.getProposalPeriod(), "kind/policy/proposal_period");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyBond(), newPolicy.getBountyBond(), "kind/policy/bounty_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyForgivenessPeriod(), newPolicy.getBountyForgivenessPeriod(), "kind/policy/bounty_forgiveness_period");
    }

    @ParameterizedTest
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able vote to approve and reject proposals")
    @DisplayName("User should be able vote to approve and reject proposals")
    @Description("Create proposals and vote 'VoteApprove', 'VoteReject'")
    @CsvSource({"approve proposal, VoteApprove, Approved",
                "fail proposal, VoteReject, Rejected"})
    void userShouldBeAbleToVoteForProposal(String purpose, String voteAction, String proposalStatus) {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Autotest - vote to %s. Poll created with NEAR CLI %s",
                purpose, getLocalDateTime());
        PollProposal pollProposal = PollProposal.of(description, "Vote");
        PollProposalDto pollProposalDto = PollProposalDto.of(pollProposal);

        AddProposalResponse addProposalNearCliResponse = nearCLISteps.addProposal(
                daoName, pollProposalDto, testAccountId, gasValue, deposit);

        Integer proposalIndexId = addProposalNearCliResponse.getId();
        String proposalID = String.format("%s-%s", daoName, proposalIndexId);

        ResponseEntity<String> response = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        VoteDto voteDto = VoteDto.of(proposalIndexId, voteAction);
        nearCLISteps.voteForProposal(daoName, voteDto, testAccountId, gasValue);

        nearCLISteps.waitForAggregation(aggregationTimeout);

        response = proposalsApiSteps.getProposalByID(proposalID);
        proposalsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        ProposalDto proposalDto = proposalsApiSteps.getResponseDto(response, ProposalDto.class);
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, proposalStatus, "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able vote to remove proposal")
    @DisplayName("User should be able vote to remove proposal")
    @Description("User should be able to create proposal and vote 'VoteRemove' for it")
    void userShouldBeAbleToVoteToApproveProposal() {
        String daoName = "testdao3-near-cli-example.sputnikv2.testnet";
        long gasValue = 100000000000000L;
        float deposit = 0.1F;

        PollProposal pollProposal = PollProposal.of(
                String.format("Autotest - vote to remove proposal. Poll created with NEAR CLI %s",
                        getLocalDateTime()), "Vote");
        PollProposalDto pollProposalDto = PollProposalDto.of(pollProposal);

        AddProposalResponse addProposalNearCliResponse = nearCLISteps.addProposal(
                daoName, pollProposalDto, testAccountId, gasValue, deposit);

        Integer proposalIndexId = addProposalNearCliResponse.getId();
        String proposalID = String.format("%s-%s", daoName, proposalIndexId);

        ResponseEntity<String> response = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        VoteDto voteDto = VoteDto.of(proposalIndexId, "VoteRemove");
        nearCLISteps.voteForProposal(daoName, voteDto, testAccountId, gasValue);

        response = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID), HttpStatus.BAD_REQUEST
        );
        proposalsApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
    }
}
