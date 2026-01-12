const { Group, GroupMember, User } = require("../models");


//Create a new Group
const createGroup = async (req, res) => {
  const { name, description } = req.body;

  const group = await Group.create({
    name,
    description,
    createdBy: req.user.id
  });

  await GroupMember.create({
    groupId: group.id,
    userId: req.user.id,
    isAdmin: true
  });

  res.status(201).json(group);
};

//Get my Groups
const getMyGroups = async (req, res) => {
  const groups = await Group.findAll({
    include: {
      model: User,
      where: { id: req.user.id },
      through: { attributes: ["isAdmin"] }
    }
  });
  res.json(groups);
};

//Get a group's details
const getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findByPk(groupId, {
    include: {
      model: User,
      attributes: ["id", "name", "email"],
      through: { attributes: ["isAdmin"] }
    }
  });

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  res.json(group);
};

//Add a member to group
const addMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  const exists = await GroupMember.findOne({
    where: { groupId, userId }
  });
  if (exists) {
    return res.status(400).json({ message: "User already in group" });
  }

  await GroupMember.create({ groupId, userId, isAdmin: false });
  res.json({ message: "Member added" });
};

//Remove an existing member from group
const removeMember = async (req, res) => {
  const { groupId, userId } = req.params;

  await GroupMember.destroy({
    where: { groupId, userId }
  });

  res.json({ message: "Member removed" });
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupDetails,
  addMember,
  removeMember
};
